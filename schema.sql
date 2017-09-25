CREATE TABLE IF NOT EXISTS annotations (
    id integer primary key,
    timestamp TEXT,
    annotation TEXT,
    source TEXT,
    source_type TEXT,
    value TEXT,
    start_id TEXT,
    start_timestamp TEXT,
    start_line INTEGER,
    start_char INTEGER,
    end_id TEXT,
    end_timestamp TEXT,
    end_line INTEGER,
    end_char INTEGER
);
CREATE TABLE IF NOT EXISTS data (
    id integer primary key,
    source TEXT,
    timestamp TEXT,
    value TEXT,
    type TEXT,
    overflow TEXT
);
CREATE TABLE IF NOT EXISTS notebookentry (
    id integer primary key,
    created_at TEXT,
    last_modified TEXT,
    name TEXT,
    text TEXT
);
CREATE TABLE IF NOT EXISTS derivativesourcedefinitions (
    id integer primary key,
    created_at TEXT,
    name TEXT,
    source_code TEXT
);
