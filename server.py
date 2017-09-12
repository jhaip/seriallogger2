from flask import Flask, render_template, jsonify, g, request, abort
from flask_cors import CORS, cross_origin

from datetime import datetime
import pytz
import iso8601
import glob
import sqlite3
import os

def utcnow():
    return datetime.now(tz=pytz.utc)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
# BASE_DIR = os.path.dirname(PROJECT_ROOT)
# template_dir = os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
template_dir = os.path.join(PROJECT_ROOT, 'static')
print(template_dir)
# app = Flask(__name__)
app = Flask(__name__, template_folder=PROJECT_ROOT)
CORS(app)

DATABASE = 'db/log.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def commit_to_db(query, parameters):
    db = get_db()
    db.cursor().execute(query, parameters)
    db.commit()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@app.route("/")
@app.route("/notebook/")
@app.route("/notebook/<entry_id>")
def index(entry_id=None):
    template_dir = os.path.join(PROJECT_ROOT, 'static')
    return render_template("index.html")

# @app.route("/api/logs")
# def apiLogs():
#     logs = glob.glob('log-*.txt')
#     results = {"results": []}
#     for logFilename in logs:
#         timestamp = datetime.strptime(logFilename, 'log-%Y-%m-%d--%H-%M-%S.txt')
#         results["results"].append({"filename": logFilename, "timestamp": timestamp.isoformat()})
#     return jsonify(results)
#
# @app.route("/api/logs/<logname>")
# def apiLog(logname):
#     with open(logname) as f:
#         content = f.read()
#     return content

@app.route("/api/data", methods=['GET', 'POST'])
def dataAccess():
    if request.method == 'POST':
        data = request.get_json()
        if data is None:
            abort(400)
        if "timestamp" not in data:
            print("assigning timestamp")
            data["timestamp"] = utcnow()
        tdata = (data["source"], data["timestamp"], data["value"], data["type"])
        commit_to_db('INSERT INTO data (source, timestamp, value, type) VALUES (?,?,?,?)', tdata)
        return ('', 204)
    else:
        results = {"results": []}
        keys = ["id", "source", "timestamp", "value", "type"]
        filter_source = request.args.get('source')
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        query = 'select * from data'
        query_args = ()
        if filter_source:
            if filter_start and filter_stop:
                filter_start_date = iso8601.parse_date(request.args.get('start'))
                filter_stop_date = iso8601.parse_date(request.args.get('stop'))
                query = 'select * from data where source = ? and timestamp >= datetime(?) and timestamp <= datetime(?)'
                query_args = (filter_source, filter_start_date, filter_stop_date)
            else:
                query = 'select * from data where source = ?'
                query_args = (filter_source,)
        for r in query_db(query, query_args):
            results["results"].append(dict(zip(keys, r)))
        return jsonify(results)

@app.route("/api/annotations", methods=['GET', 'POST'])
def annotationsFetch():
    if request.method == 'POST':
        data = request.get_json()
        if data is None:
            abort(400)
        tdata = (
            utcnow(),
            data["annotation"],
            data["source"],
            data["source_type"],
            data["value"],
            data["start_id"],
            data["start_timestamp"],
            data["start_line"],
            data["start_char"],
            data["end_id"],
            data["end_timestamp"],
            data["end_line"],
            data["end_char"],
        )
        sql = ('INSERT INTO annotations ('
               'timestamp, '
               'annotation, '
               'source, '
               'source_type, '
               'value, '
               'start_id, '
               'start_timestamp, '
               'start_line, '
               'start_char, '
               'end_id, '
               'end_timestamp, '
               'end_line, '
               'end_char)'
               'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        commit_to_db(sql, tdata)
        return ('', 204)
    else:
        results = {"results": []}
        keys = [
            "id",
            "timestamp",
            "annotation",
            "source",
            "source_type",
            "value",
            "start_id",
            "start_timestamp",
            "start_line",
            "start_char",
            "end_id",
            "end_timestamp",
            "end_line",
            "end_char",
        ]
        filter_source = request.args.get('source')
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        query = 'select * from annotations'
        query_args = ()
        if filter_start and filter_stop:
            filter_start_date = iso8601.parse_date(request.args.get('start'))
            filter_stop_date = iso8601.parse_date(request.args.get('stop'))
            if filter_source:
                query = ('select * from annotations '
                         'where end_timestamp >= ? '
                         'and start_timestamp <= ? '
                         'and source = ?')
                query_args = (filter_start_date, filter_stop_date, filter_source)
            else:
                query = 'select * from annotations where timestamp >= ? and timestamp <= ?'
                query_args = (filter_start_date, filter_stop_date)
        for r in query_db(query, query_args):
            results["results"].append(dict(zip(keys, r)))
        return jsonify(results)


@app.route("/api/derivative_sources", methods=['GET', 'POST', 'DELETE'])
def derivativeSources():
    if request.method == 'POST':
        data = request.get_json()
        if data is None:
            abort(400)
        tdata = (
            utcnow(),
            data["name"],
            data["source_code"],
        )
        sql = ('INSERT INTO derivativesources ('
               'created_at, '
               'name, '
               'source_code)'
               'VALUES (?,?,?)')
        commit_to_db(sql, tdata)
        return ('', 204)
    elif request.method == 'DELETE':
        data = request.get_json()
        if data is None:
            abort(400)
        tdata = (
            data["name"],
        )
        sql = ('DELETE FROM derivativesources'
               'WHERE name = ?')
        return ('', 204)
    else:
        results = {"results": []}
        keys = [
            "id",
            "created_at",
            "name",
            "source_code",
        ]
        query = 'select * from derivativesources'
        for r in query_db(query):
            results["results"].append(dict(zip(keys, r)))
        return jsonify(results)


@app.route("/api/notebook/entries", methods=['GET', 'POST'])
def entriesFetch():
    if request.method == 'POST':
        data = request.get_json()
        if data is None:
            abort(400)
        tdata = (
            utcnow(),
            utcnow(),
            data["name"],
            data["text"],
        )
        sql = ('INSERT INTO notebookentry ('
               'created_at, '
               'last_modified, '
               'name, '
               'text)'
               'VALUES (?,?,?,?)')
        commit_to_db(sql, tdata)
        return ('', 204)
    else:
        results = {"results": []}
        keys = [
            "id",
            "created_at",
            "last_modified",
            "name",
            "text",
        ]
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        query = 'select * from notebookentry'
        query_args = ()
        if filter_start and filter_stop:
            filter_start_date = iso8601.parse_date(request.args.get('start'))
            filter_stop_date = iso8601.parse_date(request.args.get('stop'))
            query = 'select * from notebookentry where created_at >= ? and created_at <= ?'
            query_args = (filter_start_date, filter_stop_date)
        for r in query_db(query, query_args):
            results["results"].append(dict(zip(keys, r)))
        return jsonify(results)


@app.route("/api/notebook/entries/<int:entry_id>", methods=['GET', 'PUT'])
def entryFetch(entry_id):
    if request.method == 'PUT':
        data = request.get_json()
        if data is None:
            abort(400)
        tdata = (
            utcnow(),
            data["name"],
            data["text"],
            entry_id,
        )
        sql = ('UPDATE notebookentry SET '
               'last_modified = ?, '
               'name = ?, '
               'text = ? '
               'WHERE id = ?')
        commit_to_db(sql, tdata)
        return ('', 204)
    else:
        keys = [
            "id",
            "created_at",
            "last_modified",
            "name",
            "text",
        ]
        query = 'select * from notebookentry where id = ?'
        query_args = (entry_id,)
        result = None
        for r in query_db(query, query_args):
            result = dict(zip(keys, r))
        if result is None:
            return ('', 404)
        return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
