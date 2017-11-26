def create_data(source, start, end, results, new_data_range):
    for d in results.filter(timestamp__gte=start, timestamp__lte=end):
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
        db.func.date(DataRange.start) <= end,
        db.func.date(DataRange.end) >= start
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
            db.func.date(Data.timestamp) >= start,
            db.func.date(Data.timestamp) <= end
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
    data_ranges = DataRange.query.filter(
        db.func.date(DataRange.start) <= start,
        db.func.date(DataRange.end) >= end
    )
    if data_ranges.count() == 1:
        results = Data.query.filter(
            Data.data_range == data_ranges.one(),
            db.func.date(Data.timestamp) >= start,
            db.func.date(Data.timestamp) <= end
        )
        return results

    # Fetch dependencies
    dependent_data = {}
    for dependency in source.dependencies:
        dependent_data[dependency.name] = get_data(dependency, start, end)

    # TODO: convert derivative function from text to callable function
    results = source.derivative_function(dependent_data, start, end)

    cache_results(source, start, end, results)

    return Data.query.filter(
        Data.data_source == source,
        db.func.date(Data.timestamp) >= start,
        db.func.date(Data.timestamp) <= end
    )
