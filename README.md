# seriallogger2

First create the database in a python REPL.  This creates a SQLite database called log.db with the proper tables.
'''
from server import init_db
init_db()
'''

Run the server

'''
python server.py
'''

Run serial monitor

'''
particle serial monitor | tee >(python logger.py)
'''

Visit `localhost:8005` and see signals, click on them, and add annotations.

#### pfgp "particle flash & git push"
'''
pfgp PHOTON-IDENTIFIED FIRMWARE-FILE
'''

example usage:

'''
    pfgp turkey_laser blink.ino
'''

---
Legacy:

'''
particle serial monitor | tee log-`date +%Y-%m-%d--%H-%M-%S`.txt
'''
