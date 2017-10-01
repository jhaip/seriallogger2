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
    start_line = fields.Str()
    start_char = fields.Str()
    end_id = fields.Str()
    end_timestamp = fields.Str()
    end_line = fields.Str()
    end_char = fields.Str()

    @pre_load
    def process_timestamp(self, data):
        data['timestamp'] = utcnow()

class DataSchema(Schema):
    id = fields.Int(dump_only=True)
    source = fields.Str()
    timestamp = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    value = fields.Str()
    type = fields.Str()
    overflow = fields.Str()

    def __repr__(self):
        return '<Data %r>' % self.id

    @pre_load
    def process_timestamp(self, data):
        data['timestamp'] = utcnow()

    @post_load
    def make_data(self, data):
        return Data(**data)

class NotebookEntrySchema(Schema):
    id = fields.Int(dump_only=True)
    created_at = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    last_modified = fields.Str()  # make a DateTime()
    name = fields.Str()
    text = fields.Str()

    def __repr__(self):
        return '<NotebookEntry %r>' % self.id

    @pre_load
    def process_last_modified(self, data):
        data['last_modified'] = utcnow()

class DerivativeSourceDefinitionsSchema(Schema):
    id = fields.Int(dump_only=True)
    created_at = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    name = fields.Str()
    source_code = fields.Str()

    def __repr__(self):
        return '<DerivativeSourceDefinition %r>' % self.id

    def process_created_at(self, data):
        data['created_at'] = utcnow()

class DerivativeSourcesSchema(Schema):
    id = fields.Int(dump_only=True)
    created_at = fields.Str()  # auto assign time, make a DateTime(), dump_only=True
    name = fields.Str()
    source_code = fields.Str()

    def __repr__(self):
        return '<DerivativeSource %r>' % self.id

    def process_created_at(self, data):
        data['created_at'] = utcnow()

annotation_schema = AnnotationsSchema()
annotations_schema = AnnotationsSchema(many=True)
data_schema = DataSchema()
datas_schema = DataSchema(many=True)
notebookentry_schema = NotebookEntrySchema()
notebookentries_schema = NotebookEntrySchema(many=True)
derivativesourcedefinition_schema = DerivativeSourceDefinitionsSchema()
derivativesourcedefinitions_schema = DerivativeSourceDefinitionsSchema(many=True)
derivativesource_schema = DerivativeSourcesSchema()
derivativesources_schema = DerivativeSourcesSchema(many=True)
