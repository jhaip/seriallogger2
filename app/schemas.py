from marshmallow import Schema, fields, ValidationError, pre_load, post_load
from models import *
from database import db
import pytz
import iso8601
from datetime import datetime
import sys

def utcnow():
    return datetime.now(tz=pytz.utc).isoformat()

class AnnotationsSchema(Schema):
    id = fields.Int(dump_only=True)
    timestamp = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    annotation = fields.Str()
    source = fields.Str()
    source_type = fields.Str()
    value = fields.Str()
    start_id = fields.Str()
    start_timestamp = fields.Str()
    start_line = fields.Integer()
    start_char = fields.Integer()
    end_id = fields.Str()
    end_timestamp = fields.Str()
    end_line = fields.Integer()
    end_char = fields.Integer()

    @pre_load
    def process_timestamps(self, data):
        data['timestamp'] = utcnow()
        data['start_timestamp'] = str(data['start_timestamp'])
        data['end_timestamp'] = str(data['end_timestamp'])

    @pre_load
    def process_start_id(self, data):
        data['start_id'] = str(data['start_id'])

    @pre_load
    def process_end_id(self, data):
        data['end_id'] = str(data['end_id'])

    @pre_load
    def process_source_type(self, data):
        if 'source_type' in data:
            data['source_type'] = data['source_type']
        else:
            data['source_type'] = ''

    @post_load
    def make_annotation(self, data):
        return Annotations(**data)


class DataSourceSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    description = fields.Str()
    dependencies = fields.Nested('DataSourceSchema', many=True)
    transform_function = fields.Str()
    transform_function_language = fields.Str()

    @post_load
    def make_datasource(self, data):
        return DataSource(**data)


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
