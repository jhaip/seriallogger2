from flask import Flask, render_template, g, request, abort
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

from database import db
from views import *

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(PROJECT_ROOT, 'static')

def create_app():
    print("STARTING")
    app = Flask(__name__, template_folder=template_dir)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+PROJECT_ROOT+'/db/log.db'
    app.config['SQLALCHEMY_ECHO'] = True
    db.init_app(app)
    app.after_request(add_header)
    app.add_url_rule('/', view_func=IndexView.as_view('index'))
    app.add_url_rule("/notebook/", view_func=IndexView.as_view('index2'))
    app.add_url_rule("/notebook/<entry_id>", view_func=IndexView.as_view('index3'))
    app.add_url_rule("/sources/", view_func=IndexView.as_view('index4'))
    app.add_url_rule("/derivative-sources/", view_func=IndexView.as_view('index5'))
    app.add_url_rule("/api/sources", view_func=SourcesView.as_view('sources_view'))
    app.add_url_rule("/api/sources/<int:datasource_id>", view_func=SourcesView.as_view('source_view'))
    app.add_url_rule("/api/data", view_func=DataView.as_view('data_view'))
    app.add_url_rule("/api/annotations", view_func=AnnotationView.as_view('annotation_view'))
    app.add_url_rule("/api/derivative_source_definitions", view_func=DerivativeSourceDefinitionView.as_view('derivative_source_definitions_view'))
    app.add_url_rule("/api/notebook/entries", view_func=NotebookEntriesView.as_view('notebook_entries_view'))
    app.add_url_rule("/api/notebook/entries/<int:entry_id>", view_func=NotebookEntryView.as_view('notebook_entry_view'))
    return app


def init_db():
    print("INIT DB")

    app = Flask(__name__, template_folder=template_dir)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+PROJECT_ROOT+'/db/log.db'
    app.config['SQLALCHEMY_ECHO'] = True

    with app.app_context():
        db.init_app(app)
        db.create_all(app=app)

    # TODO: create DataSource for Annotations and View

    print("DONE")


def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

if __name__ == "__main__":
    app = create_app()
    print("TESTING")
    app.run(debug=True, host='0.0.0.0')
