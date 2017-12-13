from flask import Flask, request, jsonify
from datetime import datetime
import iso8601
import pytz
import os
import re

app = Flask(__name__)


def list_thumbnails(start, end):
    thumbs = os.listdir('../static/thumbs/')
    print(thumbs)
    p = re.compile('out([^\.]*)\.png')
    result = []
    for t in thumbs:
        #    "out2017-12-07T23_48_52-0500.png"
        # -> "out2017-12-07T23:48:52-0500.png"
        # -> "2017-12-07T23:48:52-0500"
        # -> local datetime
        # -> utc datetime
        m = p.search(t.replace("_", ":"))
        if m:
            t_timestamp = iso8601.parse_date(m.group(1))
            t_timestamp = t_timestamp.astimezone(pytz.utc)
            if t_timestamp >= start and t_timestamp <= end:
                result.append({
                    "timestamp": t_timestamp.isoformat(),
                    "url": "http://localhost:8080/play/thumbs/%s" % t
                })
    return result


@app.route('/api/')
def list_thumbnails_view():
    filter_start = request.args.get('start')
    filter_stop = request.args.get('end')
    if filter_start and filter_stop:
        filter_start_date = iso8601.parse_date(filter_start)
        filter_stop_date = iso8601.parse_date(filter_stop)
        thumbnails = list_thumbnails(filter_start_date, filter_stop_date)
        return jsonify({'results': thumbnails})
    return jsonify({'results': []})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5090, debug=True)
