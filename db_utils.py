import sqlite3

DATABASE = 'log.db'

def clear_views():
    db = sqlite3.connect(DATABASE)
    db.cursor().execute("DELETE FROM data WHERE source='view'")
    db.commit()
    db.close()

def clear_serial_data():
    db = sqlite3.connect(DATABASE)
    db.cursor().execute("DELETE FROM data WHERE source='serial'")
    db.commit()
    db.close()

def clear_annotations():
    db = sqlite3.connect(DATABASE)
    db.cursor().execute("DELETE FROM annotations")
    db.commit()
    db.close()

def clear_notebook():
    db = sqlite3.connect(DATABASE)
    db.cursor().execute("DELETE FROM notebookentry")
    db.commit()
    db.close()
