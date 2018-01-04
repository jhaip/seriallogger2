#!/bin/bash

watchmedo shell-command --patterns="*.uf2" --command='./codemakecode.sh $watch_event_type $watch_src_path' .
