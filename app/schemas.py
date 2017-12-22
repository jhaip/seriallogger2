from marshmallow import Schema, fields, ValidationError, pre_load, post_load
from models import *
from database import db
import pytz
import iso8601
from datetime import datetime
import json

def utcnow():
    return datetime.now(tz=pytz.utc).isoformat()


class DataSourceSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    description = fields.Str()
    dependencies = fields.Nested('DataSourceSchema', many=True)
    transform_function = fields.Str()
    transform_function_language = fields.Str()
    data_type = fields.Str()

    @pre_load
    def process_timestamp(self, data):
        print("process timestamp")
        print(data)
        if not data.get("description"):
            data["description"] = ""
        dependencies_data = data.get("dependencies")
        if dependencies_data:
            # data only needs to include dependency IDs
            # this code looks up the full serialization of the DataSource
            dependency_ids = set(map(lambda d: d["id"], dependencies_data))
            new_ds = DataSource.query.filter(
                DataSource.id.in_(dependency_ids)).all()
            data["dependencies"] = datasources_schema.dump(new_ds).data
        else:
            data["dependencies"] = []

    @post_load
    def make_datasource(self, data):
        return DataSource(**data)


class AnnotationsSchema(Schema):
    id = fields.Int(dump_only=True)
    timestamp = fields.DateTime()
    annotation = fields.Str()
    data_source = fields.Nested(DataSourceSchema, only=('id',), required=False,
                                default=None, allow_none=True)
    data_source_timestamp = fields.DateTime()

    @pre_load
    def process_timestamps(self, data):
        data['timestamp'] = utcnow()

        data_source_id = data.get("data_source")
        if data_source_id:
            ds = DataSource.query.filter(DataSource.id==data_source_id).all()
            data["data_source"] = datasource_schema.dump(ds).data
        else:
            data["data_source"] = None

    @post_load
    def make_annotation(self, data):
        return Annotations(**data)


class DataRangeSchema(Schema):
    id = fields.Int(dump_only=True)
    start = fields.DateTime(dump_only=True)
    end = fields.DateTime(dump_only=True)

    @post_load
    def make_datarange(self, data):
        return DataRange(**data)

# TODO: when data is POSTed from outside:
# How to assign data_source and data_range?
# DataRange: assume it's the latest value and extend the most recent values's range
# or create a range

class DataSchema(Schema):
    id = fields.Int(dump_only=True)
    data_source = fields.Nested(DataSourceSchema, only=('id',))
    data_range = fields.Nested(DataRangeSchema, dump_only=True)
    timestamp = fields.DateTime()
    value = fields.Str()

    @pre_load
    def process_timestamp(self, data):
        data['timestamp'] = datetime.now(tz=pytz.utc)
        if type(data["value"]) is not str:
            data['value'] = json.dumps(data['value'])

    @post_load
    def make_data(self, data):
        return Data(**data)


class NotebookEntrySchema(Schema):
    id = fields.Int(dump_only=True)
    created_at = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    last_modified = fields.Str()  # make a DateTime()
    name = fields.Str()
    text = fields.Str()

    @pre_load
    def process_last_modified(self, data):
        data['last_modified'] = utcnow()

    @pre_load
    def process_created_at(self, data):
        # TODO: only assign this once
        data['created_at'] = utcnow()

    @post_load
    def make_notebookentry(self, data):
        return Notebookentry(**data)

class DerivativeSourceDefinitionsSchema(Schema):
    id = fields.Int(dump_only=True)
    created_at = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    name = fields.Str()
    source_code = fields.Str()

    @pre_load
    def process_created_at(self, data):
        data['created_at'] = utcnow()

    @post_load
    def make_derivativesourcedefinition(self, data):
        return Derivativesourcedefinitions(**data)

annotation_schema = AnnotationsSchema()
annotations_schema = AnnotationsSchema(many=True)
data_schema = DataSchema()
datas_schema = DataSchema(many=True)
datasource_schema = DataSourceSchema()
datasources_schema = DataSourceSchema(many=True)
notebookentry_schema = NotebookEntrySchema()
notebookentries_schema = NotebookEntrySchema(many=True)
derivativesourcedefinition_schema = DerivativeSourceDefinitionsSchema()
derivativesourcedefinitions_schema = DerivativeSourceDefinitionsSchema(many=True)
