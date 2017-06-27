import re
import dateutil.parser

annotations = [
    {
        "log": "log-2017-06-11--20-42-24.txt",
        "id": 1,
        "timestamp": "2017-06-09T00:57:42+00:00",
        "start": 93,
        "end": 211,
        "annotation": "projector remote on",
        "value": "3169354 167 84 11 30 11 31 12 30 10 11 10 32 10 12 9 31 12 30 11 83 10 31 11 31 11 11 10 31 10 11 10 11 11 11 9 11 12"
    },
    {
        "log": "log-2017-06-11--20-50-08.txt",
        "id": 2,
        "timestamp": "2017-06-11T00:57:42+00:00",
        "start": 5,
        "end": 19,
        "annotation": "Projector Remote On Value",
        "value": "nsole log from"
    }
]


class DataResults:

    def __init__(self):
        self.annotations = [];

    def raw(self):
        return self.annotations

    def values(self):
        return map(lambda x: x["value"], self.annotations)

    def first(self):
        if len(self.annotations) > 0:
            return map(lambda x: x["value"], self.annotations)[0]
        return None

    def append(self, v):
        self.annotations.append(v)


def get_data(annotationValue, dateMin=None, dateMax=None):
    results = DataResults()
    for a in annotations:
        if re.search(annotationValue, a["annotation"], re.IGNORECASE):
            annotationTime = dateutil.parser.parse(a["timestamp"]).replace(tzinfo=None)
            if dateMin is None or annotationTime >= dateMin:
                if dateMax is None or annotationTime <= dateMax:
                    if "value" not in a:
                        a["value"] = get_value_from_log(a["log"], a["start"], a["end"])
                    aFiltered = {k: a[k] for k in ('value', 'annotation', 'log', 'timestamp')}
                    results.append(aFiltered)
    # TODO: sort by timestamp, most recent first
    return results

def get_value_from_log(logFilename, start, end):
    print "fetching value from log", logFilename, start, end
    with open(logFilename) as f:
        content = f.read()
        return content[start:end]
