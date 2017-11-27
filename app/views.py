from flask import Flask, render_template, jsonify, g, request, abort
from flask.views import View, MethodView
from sqlalchemy import distinct
from database import db
from models import *
from schemas import *
from data_helpers import get_data
import pytz
import iso8601
from datetime import datetime
import json
import sys

def utcnow():
    return datetime.now(tz=pytz.utc)

def postHelper(request, schema):
    json_data = request.get_json()
    if not json_data:
        return jsonify({'message': 'No input data provided'}), 400
    data, errors = schema.load(json_data)
    if errors:
        return jsonify(errors), 422
    # print(data, file=sys.stderr)
    db.session.add(data)
    db.session.commit()
    result = schema.dump(data)
    return jsonify(result.data)

def putHelper(request, schema, model, key):
    json_data = request.get_json()
    if not json_data:
        return jsonify({'message': 'No input data provided'}), 400
    data, errors = schema.load(json_data)
    if errors:
        return jsonify(errors), 422
    instance = model.query.get_or_404(key)
    for k,v in json_data.items():
        setattr(instance, k, v)
    db.session.commit()
    return jsonify(message='Successfuly updated'), 200

def deleteHelper(request, model, key, value):
    json_data = request.get_json()
    if not json_data:
        return jsonify({'message': 'No input data provided'}), 400
    model.query.filter(getattr(model, key) == json_data[value]).delete()
    db.session.commit()
    return jsonify(message='Successfuly deleted'), 200

def deleteHelperKey(request, model, key, value):
    model.query.filter(getattr(model, key) == value).delete()
    db.session.commit()
    return jsonify(message='Successfuly deleted'), 200


class IndexView(MethodView):

    def get(self, entry_id=None):
        return render_template("index.html")


class SourcesView(MethodView):

    def post(self):
        return postHelper(request, datasource_schema)

    def put(self, datasource_id):
        return putHelper(request, datasource_schema, DataSource, datasource_id)

    def get(self):
        datasources = DataSource.query.all()
        result = datasources_schema.dump(datasources)
        return jsonify({'results': result.data})

    def delete(self, datasource_id):
        return deleteHelperKey(request, DataSource, "id", datasource_id)


class DataView(MethodView):

    def post(self):
        return postHelper(request, data_schema)

    def get(self):
        filter_source = request.args.get('source')
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        datas = []
        if filter_source:
            if filter_start and filter_stop:
                filter_start_date = iso8601.parse_date(request.args.get('start'))
                filter_stop_date = iso8601.parse_date(request.args.get('stop'))
                datas = (Data.query
                    .filter_by(source=filter_source)
                    .filter(Data.timestamp >= filter_start_date)
                    .filter(Data.timestamp <= filter_stop_date)
                )
            else:
                datas = Data.query.filter_by(source=filter_source)
        else:
            datas = Data.query.all()
        result = datas_schema.dump(datas)
        return jsonify({'results': result.data})


class AnnotationView(MethodView):

    def post(self):
        return postHelper(request, annotation_schema)

    def get(self):
        filter_source = request.args.get('source')
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        datas = []
        if filter_source:
            if filter_start and filter_stop:
                filter_start_date = iso8601.parse_date(request.args.get('start'))
                filter_stop_date = iso8601.parse_date(request.args.get('stop'))
                datas = (Annotations.query
                    .filter_by(source=filter_source)
                    .filter(db.func.date(Annotations.start_timestamp) >= filter_start_date)
                    .filter(db.func.date(Annotations.start_timestamp) <= filter_stop_date)
                )
            else:
                datas = Annotations.query.filter_by(source=filter_source)
        else:
            if filter_start and filter_stop:
                filter_start_date = iso8601.parse_date(request.args.get('start'))
                filter_stop_date = iso8601.parse_date(request.args.get('stop'))
                datas = (Annotations.query
                    .filter(db.func.date(Annotations.timestamp) >= filter_start_date)
                    .filter(db.func.date(Annotations.timestamp) <= filter_stop_date)
                )
            else:
                datas = Annotations.query.all()
        result = annotations_schema.dump(datas)
        return jsonify({'results': result.data})


class DerivativeSourceDefinitionView(MethodView):

    def post(self):
        return postHelper(request, derivativesourcedefinition_schema)

    def delete(self):
        return deleteHelper(request, Derivativesourcedefinitions, "name", "name")

    def get(self):
            derivative_source_definitions = Derivativesourcedefinitions.query.all()
            result = derivativesourcedefinitions_schema.dump(derivative_source_definitions)
            # print(result, file=sys.stderr)
            return jsonify({'results': result.data})


class NotebookEntriesView(MethodView):

    def post(self):
        return postHelper(request, notebookentry_schema)

    def get(self):
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        datas = []
        if filter_start and filter_stop:
            filter_start_date = iso8601.parse_date(request.args.get('start'))
            filter_stop_date = iso8601.parse_date(request.args.get('stop'))
            datas = (Notebookentry.query
                .filter(db.func.date(Notebookentry.created_at) >= filter_start_date)
                .filter(db.func.date(Notebookentry.created_at) <= filter_stop_date)
            )
        else:
            datas = Notebookentry.query.all()
        result = notebookentries_schema.dump(datas)
        return jsonify({'results': result.data})


class NotebookEntryView(MethodView):

    def put(self, entry_id):
        return putHelper(request, notebookentry_schema, Notebookentry, entry_id)

    def get(self, entry_id):
        print("--")
        print(request.args)
        print("--", file=sys.stderr)
        print(entry_id, file=sys.stderr)
        notebookentry_source = Notebookentry.query.filter_by(id=entry_id).first_or_404()
        result = notebookentry_schema.dump(notebookentry_source)
        return jsonify(result.data)
