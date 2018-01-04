#!/bin/bash

echo "$1 - $2 - $3"
if [ $1 = "created" ] || [ $1 = "moved" ]
then
    mypath=$2
    if [ $1 = "moved" ]
    then
        mypath=$3
    fi
    cp "$mypath" /Volumes/CPLAYBOOT/
    # run node script to convert it to a new .json file
    node ../uf2-source-code/get_uf2_source_code.js "$mypath"
    git add "$mypath"
    git add "${mypath/.uf2/.json}"
    git commit -m "MakeCode code flash of $mypath"
	git push
fi
