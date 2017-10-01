from flask import Flask, render_template, jsonify, g, request, abort
from flask.views import View
from database import db
from models import *
from schemas import *
import sys

def utcnow():
    return datetime.now(tz=pytz.utc)

class IndexView(View):

    def dispatch_request(self):
        return render_template("index.html")


class SourcesView(View):

    def dispatch_request(self):
        if request.method == 'GET':
            results = {"results": []}
            # query = 'SELECT DISTINCT source FROM data'
            # for r in query_db(query):
            #     results["results"].append(r[0])
            return jsonify(results)


class DataView(View):

    def dispatch_request(self):
        if request.method == 'POST':
            data = request.get_json()
            if data is None:
                abort(400)
            source = data.get("source")
            timestamp = data.get("timestamp")
            value = data.get("value")
            _type = data.get("type")
            data.pop('source', None)
            data.pop('timestamp', None)
            data.pop('value', None)
            data.pop('type', None)
            overflow = json.dumps(data)
            if not timestamp:
                print("assigning timestamp")
                timestamp = utcnow()
            tdata = (source, timestamp, value, _type, overflow)
            commit_to_db('INSERT INTO data (source, timestamp, value, type, overflow) VALUES (?,?,?,?,?)', tdata)
            return ('', 204)
        else:
            results = {"results": []}
            keys = ["id", "source", "timestamp", "value", "type", "overflow"]
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


class AnnotationView(View):

    def dispatch_request(self):
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


class DerivativeSourceDefinitionView(View):

    def dispatch_request(self):
        if request.method == 'POST':
            data = request.get_json()
            if data is None:
                abort(400)
            tdata = (
                utcnow(),
                data["name"],
                data["source_code"],
            )
            sql = ('INSERT INTO derivativesourcedefinitions ('
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
            sql = ('DELETE FROM derivativesourcedefinitions'
                   'WHERE name = ?')
            return ('', 204)
        else:
            derivative_source_definitions = Derivativesourcedefinitions.query.all()
            print(derivative_source_definitions, file=sys.stderr)
            # Serialize the queryset
            result = derivativesourcedefinitions_schema.dump(derivative_source_definitions)
            print(result, file=sys.stderr)
            return jsonify({'results': result.data})


class DerivativeSourceView(View):

    def dispatch_request(self):
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


class NotebookEntriesView(View):

    def dispatch_request(self):
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


class NotebookEntryView(View):

    def dispatch_request(self):
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
