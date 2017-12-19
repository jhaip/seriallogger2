from database import db
from models import Data, DataRange, DataSource
from schemas import datas_schema
import iso8601
import json
from datetime import datetime, timezone


def create_data(source, start, end, results, new_data_range):
    start = start.replace(tzinfo=None)
    end = end.replace(tzinfo=None)
    for d in results:
        d_timestamp = d["timestamp"]
        if not isinstance(d_timestamp, datetime):
            d_timestamp = iso8601.parse_date(d_timestamp)
            d_timestamp = d_timestamp.replace(tzinfo=None)
        else:
            d_timestamp = d_timestamp.replace(tzinfo=None)
        print("----- NEW DATA RANGE")
        print(new_data_range)
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
    # TODO: new data range override all but has the wrong range!
    # Should be the min and max of start, end and it's overalapping ranges
    new_data_range = DataRange(start=start, end=end, data_source=source)
    db.session.add(new_data_range)
    db.session.commit()
    # Might not need to refetch
    new_data_range = DataRange.query.filter(DataRange.start==start,
                                            DataRange.end==end,
                                            DataRange.data_source==source).one()

    overlapping_data_ranges = DataRange.query.filter(
        DataRange.data_source == source,
        DataRange.start <= end,
        DataRange.end >= start,
        DataRange.id != new_data_range.id
    ).order_by(DataRange.start)

    overlapping_data_ranges_count = overlapping_data_ranges.count()
    if overlapping_data_ranges_count is 0:
        print("REturning early because overlapping_data_ranges_count is 0")
        create_data(source, start, end, results, new_data_range)
        return

    first_overlapping_data_range_datetime = (
        overlapping_data_ranges[0].start.replace(tzinfo=None))
    if first_overlapping_data_range_datetime > start:
        print("----- first overlapping")
        create_data(source, start, first_overlapping_data_range_datetime, results, new_data_range)
    elif first_overlapping_data_range_datetime < start:
        new_data_range.start = first_overlapping_data_range_datetime
        db.session.add(new_data_range)
        db.session.commit()

    for i, data_range in enumerate(overlapping_data_ranges):
        print("looking at overlapping_data_ranges index " + str(i))
        existing_data = Data.query.filter(Data.data_range == data_range)
        for d in existing_data:
            d.data_range = new_data_range
            db.session.add(d)
        db.session.commit()
        if i < overlapping_data_ranges_count - 1:
            next_overlapping_data_range_datetime = (
                overlapping_data_ranges[i + 1].start.replace(tzinfo=None))
            print("----- overlapping")
            create_data(
                source,
                data_range.end.replace(tzinfo=None),
                next_overlapping_data_range_datetime,
                results,
                new_data_range
            )

    end_overlapping_data_range_datetime = (
        overlapping_data_ranges[-1].end.replace(tzinfo=None))
    if end_overlapping_data_range_datetime < end:
        print("----- end overlapping")
        create_data(source, end_overlapping_data_range_datetime,
                    end, results, new_data_range)
    elif end_overlapping_data_range_datetime > end:
        new_data_range.end = end_overlapping_data_range_datetime
        db.session.add(new_data_range)
        db.session.commit()

    print("---- deleting overlapping ranges")
    for odr in overlapping_data_ranges:
        db.session.delete(odr)
    db.session.commit()


def compute(transform_function, dependent_data, start, end):
    l = {"dependent_data": dependent_data, "start": start, "end": end}
    f = "def transform_function_wrapper(dependent_data, start, end):\n"
    f += '\n'.join(map(lambda x: '\t'+x, transform_function.splitlines()))
    f += '\nresults = transform_function_wrapper(dependent_data, start, end)'
    # TODO:
    # - limit scope of exec or make it harmless
    # - support other languages (data_source.transform_function_language)
    print("----")
    print(f)
    print("----")
    try:
        exec(f, l)
        return l["results"]
    except BaseException as error:
        print('An exception occurred: {}'.format(error))
        return []


def get_data(data_source, start, end):
    start = start.replace(tzinfo=None)
    end = end.replace(tzinfo=None)
    results = None
    # Check cache
    print("CHECK CACHE")
    data_ranges = DataRange.query.filter(
        DataRange.data_source == data_source,
        DataRange.start <= start,
        DataRange.end >= end
    )
    if data_ranges.count() == 1:
        print("------ RETURNING CACHE")
        data = Data.query.filter(
            Data.data_source == data_source,
            Data.data_range == data_ranges.one(),
            Data.timestamp >= start,
            Data.timestamp <= end
        ).all()
        data_dump = datas_schema.dump(data)
        return data_dump.data
    else:
        # No full cache hit, but check for a partial cache hit
        # from start to somewhere in the middle
        # and filling in the gap to the end will only take one fetch
        data_ranges = DataRange.query.filter(DataRange.data_source == data_source,
                                             DataRange.end > start,
                                             DataRange.end <= end,
                                             DataRange.start <= start)
        if data_ranges.count() == 1:
            print("FILLING IN END GAP")
            data_range = data_ranges.one()
            cached_data = Data.query.filter(
                Data.data_source == data_source,
                Data.data_range == data_range,
                Data.timestamp >= start,
                Data.timestamp <= end).all()
            cached_data_dump = datas_schema.dump(cached_data)
            new_data_dump = get_data(data_source, data_range.end, end)
            # new data won't hit the cache
            # new data will overlap cached_data range and auto join
            print("FILLING IN END GAP RESULTS:")
            print(cached_data_dump.data)
            print(type(cached_data_dump.data))
            print(new_data_dump)
            print(type(new_data_dump))
            results = list(cached_data_dump.data) + list(new_data_dump)
            return results

    if results is None:
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
        print(type(results))
        raise Exception("results is not a list!")
    for r in results:
        if type(r) is not dict:
            print(r)
            print(type(r))  # write now it's a data model!
            raise Exception('results element is not a dict!')
        r_timestamp_date = iso8601.parse_date(r["timestamp"])
        if type(r["value"]) not in [str, int, float]:
            print(r["value"])
            print(type(r["value"]))
            raise Exception("result element's value field is not a str, int, or float")

    print("CACHING RESULTS")
    cache_results(data_source, start, end, results)

    print("RETURNING")
    data = Data.query.filter(
        Data.data_source == data_source,
        Data.timestamp >= start,
        Data.timestamp <= end
    ).all()
    data_dump = datas_schema.dump(data)
    return data_dump.data


def make_data_source(name, func, func_lang, description="", dependencies=[]):
    data_source = DataSource(
        name=name,
        description=description,
        dependencies=dependencies,
        transform_function=func,
        transform_function_language=func_lang
    )
    db.session.add(data_source)
    db.session.commit()
    return data_source


def find_data_source(name):
    return DataSource.query.filter(DataSource.name==name).one()


def make_http_request_data_source(name, url, headers={}, description=""):
    transform_function = """
    import requests
    url = "{}"
    headers = {}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        data = r.json()
        for d in data:
            d["timestamp"] = d["created_at"]
        return data
    return []
    """.format(url, json.dumps(headers))
    return make_data_source(name, transform_function, "python", description=description)


def clear_cache(data_source):
    # TODO: check for circular dependencies
    for d in Data.query.filter(Data.data_source == data_source):
        db.session.delete(d)
    db.session.commit()

    for d in DataRange.query.filter(DataRange.data_source == data_source):
        db.session.delete(d)
    db.session.commit()

    for dependent_data_source in data_source.parents:
        print("GOING DEEPER!!!!!!!!")
        clear_cache(dependent_data_source)
