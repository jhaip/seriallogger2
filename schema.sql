CREATE TABLE annotations (id integer primary key, data_id text, timestamp text, annotation text, value text, start_line integer, start_char integer, end_line integer, end_char integer);
CREATE TABLE data (id integer primary key, source text, timestamp text, value text, type text);
