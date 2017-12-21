from flask import Flask, render_template, jsonify, g, request, abort
from flask.views import View, MethodView
from sqlalchemy import distinct
from database import db
from models import *
from schemas import *
from data_helpers import get_data, find_data_source, clear_cache
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

def putHelper(request, schema, model, model_key, key_value):
    json_data = request.get_json()
    if not json_data:
        return jsonify({'message': 'No input data provided'}), 400
    data, errors = schema.load(json_data)
    if errors:
        return jsonify(errors), 422
    instance = model.query.filter(model_key == key_value).one()  # todo: handle error
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
        schema = datasource_schema

        json_data = request.get_json()
        dependencies_data = json_data.pop("dependencies", None)
        if not json_data:
            return jsonify({'message': 'No input data provided'}), 400
        data, errors = schema.load(json_data)
        if errors:
            return jsonify(errors), 422
        # print(data, file=sys.stderr)
        db.session.add(data)
        db.session.commit()

        result = schema.dump(data)
        result_data = result.data

        instance = DataSource.query.filter(DataSource.id == result_data["id"]).one()  # todo: handle error

        if dependencies_data:
            # data only needs to include dependency IDs
            # this code looks up the full serialization of the DataSource
            dependency_ids = set(map(lambda d: d["id"], dependencies_data))
            corrected_dependencies = DataSource.query.filter(
                DataSource.id.in_(dependency_ids)).all()
            setattr(instance, "dependencies", corrected_dependencies)
            result_data["dependencies"] = datasources_schema.dump(corrected_dependencies).data
            db.session.commit()

        return jsonify(result_data)

    def put(self, datasource_id):
        schema = datasource_schema
        model = DataSource
        model_key = DataSource.id
        key_value = datasource_id

        json_data = request.get_json()
        if not json_data:
            return jsonify({'message': 'No input data provided'}), 400
        data, errors = schema.load(json_data)
        if errors:
            return jsonify(errors), 422
        instance = model.query.filter(model_key == key_value).one()  # todo: handle error

        dependencies_data = json_data.get("dependencies")
        if dependencies_data:
            # data only needs to include dependency IDs
            # this code looks up the full serialization of the DataSource
            dependency_ids = set(map(lambda d: d["id"], dependencies_data))
            corrected_dependencies = DataSource.query.filter(
                DataSource.id.in_(dependency_ids)).all()
            json_data["dependencies"] = corrected_dependencies

        for k,v in json_data.items():
            setattr(instance, k, v)
        db.session.commit()

        # Clear cached data
        clear_cache(instance)

        return jsonify(message='Successfuly updated'), 200
        # json_data = request.get_json()
        # if not json_data:
        #     return jsonify({'message': 'No input data provided'}), 400
        # data, errors = schema.load(json_data)
        # if errors:
        #     return jsonify(errors), 422
        # db.session.add(data)
        # db.session.commit()
        # result = schema.dump(data)
        # return jsonify(result.data)

    def get(self):
        datasources = DataSource.query.all()
        result = datasources_schema.dump(datasources)
        return jsonify({'results': result.data})

    def delete(self, datasource_id):
        return deleteHelperKey(request, DataSource, "id", datasource_id)


class DataView(MethodView):

    def post(self):
        schema = data_schema
        json_data = request.get_json()
        if not json_data:
            return jsonify({'message': 'No input data provided'}), 400

        data_source = DataSource.query.filter_by(name=json_data["data_source"]).first_or_404()

        val = json_data["value"]
        if type(val) is not str:
            val = json.dumps(val)
        d = Data(data_source=data_source,
                 timestamp=datetime.now(tz=pytz.utc),
                 value=val)
        db.session.add(d)
        db.session.commit()

        result = schema.dump(d)
        return jsonify(result.data)

    def get(self):
        filter_source = request.args.get('source')
        filter_start = request.args.get('start')
        filter_stop = request.args.get('stop')
        if filter_source:
            data_source = find_data_source(filter_source)
            if filter_start and filter_stop:
                filter_start_date = iso8601.parse_date(request.args.get('start'))
                filter_stop_date = iso8601.parse_date(request.args.get('stop'))
                try:
                    results = get_data(data_source, filter_start_date, filter_stop_date)
                    return jsonify({'results': results})
                except BaseException as error:
                    # print('An exception occurred: {}'.format(error))
                    return jsonify({'error': str(error)}), 400

        return jsonify({'message': 'Invalid URL format'}), 400


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
        return putHelper(request, notebookentry_schema, Notebookentry, Notebookentry.id, entry_id)

    def get(self, entry_id):
        print("--")
        print(request.args)
        print("--", file=sys.stderr)
        print(entry_id, file=sys.stderr)
        notebookentry_source = Notebookentry.query.filter_by(id=entry_id).first_or_404()
        result = notebookentry_schema.dump(notebookentry_source)
        return jsonify(result.data)
