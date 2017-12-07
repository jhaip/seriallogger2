#!/bin/bash
for name in *.ts; do
  ffmpeg -i "$name" -ss 0 -vframes 1 "thumb${name%.*}.png" 
done 
