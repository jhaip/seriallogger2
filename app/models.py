from database import db
import sys

class Annotations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(100), nullable=False)
    annotation = db.Column(db.String(200), nullable=False)
    source = db.Column(db.String(100), nullable=False)
    source_type = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Text, nullable=False)
    start_id = db.Column(db.String(100), nullable=False)
    start_timestamp = db.Column(db.String(100), nullable=False)
    start_line = db.Column(db.Integer, nullable=False)
    start_char = db.Column(db.Integer, nullable=False)
    end_id = db.Column(db.String(100), nullable=False)
    end_timestamp = db.Column(db.String(100), nullable=False)
    end_line = db.Column(db.Integer, nullable=False)
    end_char = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<Annotation %r>' % self.id

class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(100), nullable=False)
    overflow = db.Column(db.Text, nullable=False, default="")

    def __repr__(self):
        return '<Data %r>' % self.id

class DataSource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False)
    headers = db.Column(db.Text, nullable=False)
    request_data = db.Column(db.Text, nullable=False)
    request_type = db.Column(db.String(100), nullable=False)
    transform_function = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<DataSource %r>' % self.id

"""
{
"description": "Firmware code on Photon",
"headers": "{\"Authorization\":\"Basic FILLINSECRET==\"}",
"name": "code",
"request_data": "",
"request_type": "GET",
"transform_function": "return sourceData.map(function(c) {             var value = c.commit.message + '\\r\\n' + c.commit.url;             return {                 'value': value,                 'id': c.sha,                 'timestamp': c.commit.author.date             };           });",
"url": "https://api.github.com/repos/jhaip/seriallogger2/commits?sha=master&path=photon"
}

{
"description": "Data from Adafruit.io",
"headers": "{\"X-AIO-Key\":\"3a3688bc5a6f46da9c5281823032892f\"}",
"name": "adafruit",
"request_data": "",
"request_type": "GET",
"transform_function": "return sourceData.map(function(c) { c.timestamp = c.created_at; return c; });",
"url": "https://io.adafruit.com/api/v2/jhaip/feeds/serial-log-data/data"
}
"""

class Notebookentry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.String(100), nullable=False)
    last_modified = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    text = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<NotebookEntry %r>' % self.id

class Derivativesourcedefinitions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    source_code = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<DerivativeSourceDefinition %r>' % self.id

class Derivativesources(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    source_code = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<DerivativeSource %r>' % self.id
