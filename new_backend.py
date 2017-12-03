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
    dsd = {}
    dsd["name"] = "four"
    dsd["description"] = "test"
    dsd["dependencies"] = [find_data_source("test")]
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
    for d in DataSource.query.all():
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

with app.app_context():
    make_http_request_data_source("serial", "https://io.adafruit.com/api/v2/jhaip/feeds/serial-log-data/data", headers={"X-AIO-Key":"3a3688bc5a6f46da9c5281823032892f"})

with app.app_context():
    d = get_data(find_data_source("serial"), datetime(2016,1,1).replace(tzinfo=timezone.utc), datetime(2018,1,1).replace(tzinfo=timezone.utc))
    print(d)
