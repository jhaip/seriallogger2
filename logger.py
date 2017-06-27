#!/usr/bin/env python
import sys
import time

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


with open("hello.txt", "w") as f:
    for line in input_stream:
        f.write(line)
