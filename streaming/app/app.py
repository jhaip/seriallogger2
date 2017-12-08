from flask import Flask, request, jsonify
from datetime import datetime
import iso8601

app = Flask(__name__)

@app.route('/api/')
def list_thumbnails():
    filter_start = request.args.get('start')
    filter_stop = request.args.get('end')
    if filter_start and filter_stop:
        filter_start_date = iso8601.parse_date(filter_start)
        filter_stop_date = iso8601.parse_date(filter_stop)
        return jsonify({'results': [1,2,3]})
    return jsonify({'results': []})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5090, debug=True)
