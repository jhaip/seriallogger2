def create_data(source, start, end, results, new_data_range):
    for d in results.filter(timestamp__gte=start, timestamp__lte=end):
        # Data.create(data_range=new_data_range, data_source=source, timestamp=d.timestamp, value=d.value)
        data, errors = schema.load(data_range=new_data_range, data_source=source, timestamp=d.timestamp, value=d.value)
        if errors:
            return jsonify(errors), 422
        db.session.add(data)
        db.session.commit()


def cache_results(source, start, end, results):
    new_data_range = DataRange.create(start=start, end=end)
    overlapping_data_ranges = DataRange.query(end__gte=start, start__lte=end).order_by("start")

    if len(overlapping_data_ranges) is 0:
        create_data(source, start, end, results, new_data_range)
        return

    if overlapping_data_ranges[0].start > start:
        create_data(source, start, data_range.start, results, new_data_range)

    for i, data_range in enumerate(overlapping_data_ranges):
        Data.query(data_range=data_range, timestamp__gte=start, timestamp__lte=end).update(data_range=new_data_range)
        if i < len(overlapping_data_ranges)-1:
            create_data(source, data_range.end, overlapping_data_ranges[i+1].start, results, new_data_range)

    if overlapping_data_ranges[-1].end < end:
        create_data(source, data_range.end, end, results, new_data_range)

    overlapping_data_ranges.delete()


def get_data(data_source, start, end):
    data_range = DataRange.query(start__lte=start, end__gte=end)
    if data_range.exists():
        results = Data.query(data_range=data_range, timestamp__gte=start, timestamp__lte=end)
        return results

    dependentData = {}
    for dependentSource in source.dependencies:
        dependentData[dependentSource.name] = get_data(dependentSource, start, end)

    results = source.derivative_function(dependentData, start, end)

    cache_results(source, start, end, results)

    return Data.query(data_source=source, start__gte=start, end__lte=end)
