#!/usr/bin/env python
import sys
import time
import requests

# Modifed source from https://stackoverflow.com/questions/11109859/pipe-output-from-shell-command-to-a-python-script

# use stdin if it's full
if not sys.stdin.isatty():
    input_stream = sys.stdin

# otherwise, read the given filename
else:
    try:
        input_filename = sys.argv[1]
    except IndexError:
        message = 'need filename as first argument if stdin is not full'
        raise IndexError(message)
    else:
        input_stream = open(input_filename, 'rU')

inputEmptyCount = 0
bufferString = ""
bufferSize = 0
with open("hello.txt", "w") as f:
    try:
        while True:
            line = input_stream.readline()
            if line:
                f.write(line)
                bufferString += line
                bufferSize += 1
                inputEmptyCount = 0
                if bufferSize > 2:
                    r = requests.post('http://localhost:5000/api/data', json={"source": "serial", "value": bufferString, "type": "String"})
                    print "SEND REQUEST", r.status_code
                    bufferString = ""
                    bufferSize = 0
            if not input_stream.isatty():
                inputEmptyCount += 1
                if inputEmptyCount > 2:
                    break
    except:
        print "BREAK"
print "DONE"
