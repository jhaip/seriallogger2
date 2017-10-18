from flask import Flask, render_template, jsonify, g, request, abort
from flask.views import View, MethodView
from sqlalchemy import distinct
from database import db
from models import *
from schemas import *
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


class DatabaseAdminView(MethodView):

    def post(self):
        print("ABOUT TO CREATE DATABAES", file=sys.stderr)
        db.create_all()
        db.session.commit()
        print("DONE CREATE DATABAES", file=sys.stderr)
        return jsonify(message='Successfuly created database'), 200


class IndexView(MethodView):

    def get(self, entry_id=None):
        return render_template("index.html")


class SourcesView(MethodView):

    def post(self):
        return postHelper(request, datasource_schema)

    def get(self):
        datasources = DataSource.query.all()
        result = datasources_schema.dump(datasources)
        return jsonify({'results': result.data})

    def delete(self):
        return deleteHelper(request, DataSource, "name", "name")


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
                    .filter(db.func.date(Data.timestamp) >= filter_start_date)
                    .filter(db.func.date(Data.timestamp) <= filter_stop_date)
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


class DerivativeSourceView(MethodView):

    def post(self):
        return postHelper(request, derivativesource_schema)

    def delete(self):
        return deleteHelper(request, Derivativesources, "name", "name")

    def get(self):
        derivative_sources = Derivativesources.query.all()
        result = derivativesources_schema.dump(derivative_sources)
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
