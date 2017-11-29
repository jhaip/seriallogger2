from database import db
from models import *
from schemas import *
import pytz
import iso8601
from datetime import datetime


def create_data(source, start, end, results, new_data_range):
    for d in results:
        d_timestamp = d["timestamp"]
        if not isinstance(d_timestamp, datetime):
            d_timestamp = iso8601.parse_date(d_timestamp)
        print("----- TIMESTAMP:")
        print(d_timestamp)
        print(type(d_timestamp))
        print(start)
        print(type(start))
        print(end)
        if d_timestamp >= start and d_timestamp <= end:
            data = Data(
                data_range=new_data_range,
                data_source=source,
                timestamp=d_timestamp,
                value=d["value"]
            )
            db.session.add(data)
    db.session.commit()


def cache_results(source, start, end, results):
    new_data_range = DataRange(start=start, end=end, data_source=source)
    db.session.add(new_data_range)
    db.session.commit()

    overlapping_data_ranges = DataRange.query.filter(
        DataRange.data_source == source,
        DataRange.start <= end,
        DataRange.end >= start,
        DataRange.id != new_data_range.id
    ).order_by(DataRange.start)

    print("INSIDE cache_results")
    print(start)
    print(type(start))
    print(end)
    print(type(end))
    print(results)
    print(type(results))

    overlapping_data_ranges_count = overlapping_data_ranges.count()
    if overlapping_data_ranges_count is 0:
        print("REturning early because overlapping_data_ranges_count is 0")
        create_data(source, start, end, results, new_data_range)
        return

    if overlapping_data_ranges[0].start > start:
        create_data(source, start, data_range.start, results, new_data_range)

    for i, data_range in enumerate(overlapping_data_ranges):
        print("looking at overlapping_data_ranges index "+str(i))
        existing_data = Data.query.filter(
            Data.data_range == data_range,
            Data.timestamp >= start,
            Data.timestamp <= end
        )
        for d in existing_data:
            d.data_range = new_data_range
            db.session.add(data)
        db.session.commit()
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

    print("after, deleting")

    for odr in overlapping_data_ranges:
        db.session.delete(odr)
    db.session.commit()


def compute(transform_function, dependent_data, start, end):
    l = {"dependent_data": dependent_data, "start": start, "end": end}
    f = """
def transform_function_wrapper(dependent_data, start, end):
    {body}

results = transform_function_wrapper(dependent_data, start, end)
""".format(body=transform_function)
    # TODO:
    # - limit scope of exec or make it harmless
    # - support other languages (data_source.transform_function_language)
    exec(f, l)
    return l["results"]


def get_data(data_source, start, end):
    # Check cache
    print("CHECK CACHE")
    data_ranges = DataRange.query.filter(
        DataRange.data_source == data_source,
        DataRange.start <= start,
        DataRange.end >= end
    )
    if data_ranges.count() == 1:
        results = Data.query.filter(
            Data.data_range == data_ranges.one(),
            Data.timestamp >= start,
            Data.timestamp <= end
        ).all()
        return results

    # Fetch dependencies
    print("FETCHING DEPENDENCIES:")
    dependent_data = {}
    for dependency in data_source.dependencies:
        print("FETCHING - " + str(dependency.name))
        dependent_data[dependency.name] = get_data(dependency, start, end)

    results = compute(data_source.transform_function, dependent_data, start, end)

    # Validate results
    print(data_source.transform_function)
    print("RESULTS:")
    print(results)
    if type(results) is not list:
        raise Exception("results is not a list!")
    for r in results:
        if type(r) is not dict:
            print(r)
            print(type(r))  # write now it's a data model!
            raise Exception('results element is not a dict!')
        if isinstance(r["timestamp"], datetime):
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
    ).all()
