import sqlite3

DATABASE = 'db/log.db'

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

def clear_all():
    clear_views()
    clear_serial_data()
    clear_annotations()
    clear_notebook()

def init_db():
    db = sqlite3.connect(DATABASE)
    with open('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

def migration__data__0001():
    db = sqlite3.connect(DATABASE)
    c = db.cursor()
    try:
        c.execute('ALTER TABLE data ADD COLUMN overflow TEXT;')
    except:
        print("Error: column has probably already been added")
    c.close()
