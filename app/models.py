from database import db


class Annotations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime)
    annotation = db.Column(db.String(200), nullable=False)
    data_source_id = db.Column(db.Integer, db.ForeignKey('data_source.id'))
    data_source = db.relationship('DataSource', backref='annotations', lazy=True)
    data_source_timestamp = db.Column(db.DateTime)

    def __repr__(self):
        return '<Annotation %r>' % self.id


class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_source_id = db.Column(db.Integer, db.ForeignKey('data_source.id'), nullable=False)
    data_source = db.relationship('DataSource', backref='data', lazy=True)
    data_range_id = db.Column(db.Integer, db.ForeignKey('data_range.id'))
    data_range = db.relationship('DataRange', backref='data', lazy=True)
    timestamp = db.Column(db.DateTime)
    value = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<Data %r>' % self.id


data_source_dependencies = db.Table('data_source_dependencies',
    db.Column('data_source_id', db.Integer, db.ForeignKey('data_source.id'), primary_key=True),
    db.Column('data_source_dependency_id', db.Integer, db.ForeignKey('data_source.id'), primary_key=True)
)


class DataSource(db.Model):
    __tablename__ = 'data_source'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    dependencies = db.relationship(
        'DataSource',
        secondary=data_source_dependencies,
        primaryjoin=id==data_source_dependencies.c.data_source_id,
        secondaryjoin=id==data_source_dependencies.c.data_source_dependency_id,
        backref="parents"
    )
    transform_function = db.Column(db.Text, nullable=False)
    transform_function_language = db.Column(db.String(100), nullable=False)
    data_type = db.Column(db.String(100), nullable=False, default="TEXT")

    def __repr__(self):
        return '<DataSource %r>' % self.id


class DataRange(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_source_id = db.Column(db.Integer, db.ForeignKey('data_source.id'), nullable=False)
    data_source = db.relationship('DataSource', backref='data_ranges', lazy=True)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)

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
