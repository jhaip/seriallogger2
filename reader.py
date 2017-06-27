import glob

logs = glob.glob('log-*.txt')

for logFilename in logs:
    print "----" + logFilename
    with open(logFilename) as f:
        content = f.read()
        # f.readLines() returns a list
        print content
