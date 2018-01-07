#!/bin/bash

echo "$1 - $2 - $3"
if [ $1 = "created" ] || [ $1 = "moved" ] || [ $1 = "modified" ]
then
    mypath=$2
    if [ $1 = "moved" ]
    then
        mypath=$3
    fi
    cp "$mypath" ./code/.
    git add .
    git commit -m "Circuit Python code flash of $mypath"
	git push
fi
