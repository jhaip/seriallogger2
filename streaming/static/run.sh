#!/bin/bash

watchmedo shell-command --patterns="*.py;*.txt;*.ts" --command='./gen_thumb.sh $watch_event_type $watch_src_path' . &

ffmpeg -f avfoundation -f avfoundation -r 30 -framerate 30.000030 -video_size 640x480 -i "0" -map 0 -f segment -segment_list playlist.m3u8 -segment_list_flags +live -segment_time 2 -strftime 1 "out%FT%H_%M_%S%z.ts" &
