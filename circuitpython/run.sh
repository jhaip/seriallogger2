#!/bin/bash

watchmedo shell-command --patterns="*/code.py" --command='./on_event.sh $watch_event_type "$watch_src_path" "$watch_dest_path"' /Volumes/CIRCUITPY
