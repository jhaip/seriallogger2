#!/bin/bash

if [ $1 = "modified" ]
then
    # echo "$1 - $2"
    s="$(echo "$2" | sed -e 's/\.\///' -e 's/\.ts//')"
    ffmpeg -i "$2" -ss 0 -vframes 1 "thumbs/${s}.png"
fi
