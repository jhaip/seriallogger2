from datetime import datetime

def create_data(source, start, end, results, new_data_range):
    for d in results:
        if d["timestamp"] >= start and d["timestamp"] <= end
            data = Data(
                data_range=new_data_range,
                data_source=source,
                timestamp=d.timestamp,
                value=d.value
            )
            db.session.add(data)
    db.session.commit()


def cache_results(source, start, end, results):
    new_data_range = DataRange(start=start, end=end)
    db.session.add(new_data_range)
    db.session.commit()
    overlapping_data_ranges = DataRange.query.filter(
        DataRange.start <= end,
        DataRange.end >= start
    ).order_by(DataRange.start)

    overlapping_data_ranges_count = overlapping_data_ranges.count()
    if overlapping_data_ranges_count is 0:
        print("REturning early because overlapping_data_ranges_count is 0")
        create_data(source, start, end, results, new_data_range)
        return

    if overlapping_data_ranges[0].start > start:
        create_data(source, start, data_range.start, results, new_data_range)

    for i, data_range in enumerate(overlapping_data_ranges):
        Data.query.filter(
            Data.data_range == data_range,
            Data.timestamp >= start,
            Data.timestamp <= end
        ).update({Data.data_range: new_data_range})
        if i < overlapping_data_ranges_count-1:
            create_data(
                source,
                data_range.end,
                overlapping_data_ranges[i+1].start,
                results,
                new_data_range
            )

    if overlapping_data_ranges[-1].end < end:
        create_data(source, data_range.end, end, results, new_data_range)

    overlapping_data_ranges.delete()


def get_data(data_source, start, end):
    # Check cache
    data_ranges = DataRange.query.filter(
        DataRange.start <= start,
        DataRange.end >= end
    )
    if data_ranges.count() == 1:
        results = Data.query.filter(
            Data.data_range == data_ranges.one(),
            Data.timestamp >= start,
            Data.timestamp <= end
        )
        return results

    # Fetch dependencies
    dependent_data = {}
    for dependency in source.dependencies:
        dependent_data[dependency.name] = get_data(dependency, start, end)

    f = """
    def transform_function_wrapper(dependent_data, start, end):
        {body}

    results = transform_function_wrapper(dependent_data, start, end)
    """.format(body=source.transform_function)
    # TODO:
    # - limit scope of exec or make it harmless
    # - support other languages (source.transform_function_language)
    exec(f)

    # Validate results
    if type(results) is not list:
        raise "results is not a list!"
    for r in results:
        if type(r) is not dict:
            raise 'results element is not a dict!'
        if isinstance(r["timestamp"]):
            raise "result element's timestamp field is not a valid datetime"
        if type(r["value"]) not in [str, int, float]:
            raise "result element's value field is not a str, int, or float"

    cache_results(source, start, end, results)

    return Data.query.filter(
        Data.data_source == source,
        Data.timestamp >= start,
        Data.timestamp <= end
    )


# Setup Notes

from app import create_app
from database import db
from models import DataSource, DataRange, Data
app = create_app()
with app.app_context():
    db.init_app(app)
with app.app_context():
    DataSource.query.all()

dsd = {}
dsd["name"] = "test"
dsd["description"] = ""
dsd["dependencies"] = []
dsd["transform_function"] = 'return [{"timestamp": "2017-10-05T14:48:00.000Z", "value": "1"}]'
dsd["transform_function_language"] = 'python'
ds = DataSource(**dsd)
with app.app_context():
    db.session.add(ds)
    db.session.commit()

with app.app_context():
    print(DataSource.query.one().dependencies)

f = """
def foo():
    return 5+5

print(foo())
"""
exec(f, {'__builtins__':{}, 'print': print})

transform_function = "return 11"

f = """
def bar():
    {body}

x = bar()
""".format(body=transform_function)
exec(f)

with app.app_context():
    d1 = DataSource.query.one()

dsd = {}
dsd["name"] = "four"
dsd["description"] = "test"
dsd["dependencies"] = [d1]
dsd["transform_function"] = 'return dependent_data["test"]'
dsd["transform_function_language"] = 'python'
ds = DataSource(**dsd)
with app.app_context():
    db.session.add(ds)
    db.session.commit()

from datetime import datetime, timezone
from data_helpers import get_data, make_data_source, find_data_source
from app import create_app
from database import db
from models import DataSource, DataRange, Data
import pytz
app = create_app()

with app.app_context():
    db.init_app(app)

with app.app_context():
    for d in Data.query.all():
        db.session.delete(d)
    db.session.commit()

with app.app_context():
    for d in DataRange.query.all():
        db.session.delete(d)
    db.session.commit()


with app.app_context():
    d = get_data(DataSource.query.get(1), datetime(2016,1,1).replace(tzinfo=timezone.utc), datetime(2018,1,1).replace(tzinfo=timezone.utc))
    print(d)

with app.app_context():
    d = get_data(DataSource.query.get(1), datetime(2016,1,1).replace(tzinfo=timezone.utc), datetime(2018,1,2).replace(tzinfo=timezone.utc))
    print(d)

with app.app_context():
    ds = DataSource.query.get(1)
    start = datetime(2016,1,1)
    end = datetime(2018,1,2)
    q = DataRange.query.filter(DataRange.data_source==ds, DataRange.end >= start, DataRange.end <= end, DataRange.start <= start)
    print(q.one().start)
    print(q.one().end)

with app.app_context():
    data_source = DataSource.query.get(1)
    data_ranges = DataRange.query.filter(DataRange.data_source == data_source)
    print(data_ranges.all())

with app.app_context():
    d = get_data(DataSource.query.get(4), datetime(2016,1,1).replace(tzinfo=timezone.utc), datetime(2018,1,1).replace(tzinfo=timezone.utc))
    print(d)


with app.app_context():
    results = Data.query.filter(
        Data.data_range == DataSource.query.get(1),
        Data.timestamp >= datetime(2016,1,1).replace(tzinfo=timezone.utc),
        Data.timestamp <= datetime(2018,1,1).replace(tzinfo=timezone.utc)
    ).all()
    print("RESULTS:")
    print(results)

with app.app_context():
    # Weird how "import requests" is needed inside the function
    # Not nice that indentation is needed
    ds = make_http_request_data_source("code2", "https://io.adafruit.com/api/v2/jhaip/feeds/serial-log-data/data", headers={"X-AIO-Key": "3a3688bc5a6f46da9c5281823032892f"})
    print(ds)


with app.app_context():
    d = get_data(find_data_source("code2"), datetime(2016,1,1).replace(tzinfo=timezone.utc), datetime(2018,1,1).replace(tzinfo=timezone.utc))
    print(d)
