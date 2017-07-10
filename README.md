# seriallogger2

### Create DB
First create the database in a python REPL.  This creates a SQLite database called log.db with the proper tables.
```
from server import init_db
init_db()
```

### Compile with Webpack
```
./node_modules/.bin/webpack -d
```

### Run the server
```
python server.py
```

### Record data in serial monitor
```
particle serial monitor | tee >(python logger.py)
```

### View and annotate
Visit `localhost:8005` and see signals, click on them, and add annotations.

### pfgp "particle flash & git push"
```
pfgp PHOTON-IDENTIFIED FIRMWARE-FILE-OR-FOLDER
```

example usage:
```
pfgp turkey_laser ir_recording
```

---
### Legacy:
```
particle serial monitor | tee log-`date +%Y-%m-%d--%H-%M-%S`.txt
```
