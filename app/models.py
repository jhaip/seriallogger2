from database import db

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
    overflow = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<Data %r>' % self.id

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
