#!/bin/bash

echo "$1 - $2"
if [ $1 = "created" ]
then
    cp $2 ./test-upload-folder
    # run node script to convert it to a new .json file
    node ../uf2-source-code/get_uf2_source_code.js $2
    git add $2
    git add "${2/.uf2/.json}"
    git commit -m "MakeCode code flash of $2"
	git push
fi
