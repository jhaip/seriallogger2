from flask import Flask, render_template, jsonify, g, request, abort
from datetime import datetime
import glob
import sqlite3

app = Flask(__name__)

DATABASE = 'log.db'

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


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/api/logs")
def apiLogs():
    logs = glob.glob('log-*.txt')
    results = {"results": []}
    for logFilename in logs:
        timestamp = datetime.strptime(logFilename, 'log-%Y-%m-%d--%H-%M-%S.txt')
        results["results"].append({"filename": logFilename, "timestamp": timestamp.isoformat()})
    return jsonify(results)

@app.route("/api/logs/<logname>")
def apiLog(logname):
    with open(logname) as f:
        content = f.read()
    return content

@app.route("/api/data", methods=['GET', 'POST'])
def dataAccess():
    if request.method == 'POST':
        data = request.get_json()
        if data is None:
            abort(400)
        print data
        if "timestamp" not in data:
            print "assigning timestamp"
            data["timestamp"] = datetime.now()
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
                query = 'select * from data where source = ? and timestamp > datetime(?) and timestamp < datetime(?)'
                query_args = (filter_source, filter_start, filter_stop)
                print query
                print query_args
            else:
                query = 'select * from data where source = ?'
                query_args = (filter_source,)
        for r in query_db(query, query_args):
            results["results"].append(dict(zip(keys, r)))
        print results
        return jsonify(results)

@app.route("/api/annotations", methods=['GET', 'POST'])
def annotationsFetch():
    if request.method == 'POST':
        data = request.get_json()
        if data is None:
            abort(400)
        print data
        tdata = (
            data["timestamp"],
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
            if filter_source:
                query = ('select * from annotations '
                         'where end_timestamp > ? '
                         'and start_timestamp < ? '
                         'and source = ?')
                query_args = (filter_start, filter_stop, filter_source)
            else:
                query = 'select * from annotations where timestamp > ? and timestamp < ?'
                query_args = (filter_start, filter_stop)
            print query
            print query_args
        for r in query_db(query, query_args):
            results["results"].append(dict(zip(keys, r)))
        print results
        return jsonify(results)


if __name__ == "__main__":
    app.run()
