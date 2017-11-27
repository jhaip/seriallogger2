from database import db
from models import *
from schemas import *
import pytz
import iso8601
from datetime import datetime


def create_data(source, start, end, results, new_data_range):
    for d in results:
        if d["timestamp"] >= start and d["timestamp"] <= end:
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
        if i < overlapping_data_ranges_count:
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
    print("CHECK CACHE")
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
    print("FETCHING DEPENDENCIES:")
    dependent_data = {}
    for dependency in data_source.dependencies:
        print("FETCHING - " + str(dependency.name))
        dependent_data[dependency.name] = get_data(dependency, start, end)

    results = None
    f = """
def transform_function_wrapper(dependent_data, start, end):
    {body}

results = transform_function_wrapper(dependent_data, start, end)
""".format(body=data_source.transform_function)
    # TODO:
    # - limit scope of exec or make it harmless
    # - support other languages (data_source.transform_function_language)
    exec(f, globals(), locals())

    # Validate results
    print(f)
    print(data_source.transform_function)
    print(globals())
    print(locals())
    print("RESULTS:")
    print(results)
    if type(results) is not list:
        raise Exception("results is not a list!")
    for r in results:
        if type(r) is not dict:
            raise Exception('results element is not a dict!')
        if isinstance(r["timestamp"]):
            raise Exception("result element's timestamp field is not a valid datetime")
        if type(r["value"]) not in [str, int, float]:
            raise Exception("result element's value field is not a str, int, or float")

    print("CACHING RESULTS")
    cache_results(data_source, start, end, results)

    print("RETURNING")
    return Data.query.filter(
        Data.data_source == data_source,
        Data.timestamp >= start,
        Data.timestamp <= end
    )
