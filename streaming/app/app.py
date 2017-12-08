from flask import Flask, request, jsonify
from datetime import datetime
import iso8601
import os

app = Flask(__name__)


def list_thumbnails():
    f = os.listdir('../static/thumbs/')
    print(f)
    return f


@app.route('/api/')
def list_thumbnails_view():
    filter_start = request.args.get('start')
    filter_stop = request.args.get('end')
    if filter_start and filter_stop:
        filter_start_date = iso8601.parse_date(filter_start)
        filter_stop_date = iso8601.parse_date(filter_stop)
        thumbnails = list_thumbnails()
        return jsonify({'results': thumbnails})
    return jsonify({'results': []})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5090, debug=True)
