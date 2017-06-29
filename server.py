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
        query = 'select * from data'
        query_args = ()
        if filter_source:
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
        tdata = (data["data_id"], data["timestamp"], data["annotation"], data["value"], data["start_line"], data["start_char"], data["end_line"], data["end_char"])
        # data = ('log-2017-06-11--20-42-24.txt',
        #     '2017-06-09T00:57:42+00:00',
        #     'projector remote on',
        #     '3169354 167 84 11 30 11 31 12 30 10 11 10 32 10 12 9 31 12 30 11 83 10 31 11 31 11 11 10 31 10 11 10 11 11 11 9 11 12',
        #     1, 0, 2, 0)
        # log text, timestamp text, annotation text, value text, start_line integer, start_char integer, end_line integer, end_char integer)
        commit_to_db('INSERT INTO annotations (data_id, timestamp, annotation, value, start_line, start_char, end_line, end_char) VALUES (?,?,?,?,?,?,?,?)', tdata)
        return ('', 204)
    else:
        results = {"results": []}
        keys = ["id", "data_id", "timestamp", "annotation", "value", "start_line", "start_char", "end_line", "end_char"]
        filter_data_id = request.args.get('data_id')
        query = 'select * from annotations'
        query_args = ()
        if filter_data_id:
            query = 'select * from annotations where data_id = ?'
            query_args = (filter_data_id,)
        for r in query_db(query, query_args):
            results["results"].append(dict(zip(keys, r)))
        print results
        return jsonify(results)


if __name__ == "__main__":
    app.run()
