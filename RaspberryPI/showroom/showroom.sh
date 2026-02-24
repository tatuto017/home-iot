#!/bin/bash

cd /home/tatuto/Python
. ./bin/activate

room=${1}
work_dir=$(pwd)
save_path=/home/tatuto/OneDrive/ShowRoom
file_name=${2}_$(date "+%Y%m%d_%H%M%S").mp4

record=$(ps -ef | grep streamlink | grep $room | grep -v grep | wc -l)
if [ $record -eq 0 ]; then
  python showroom_webgl.py $room
  if [ $? -eq 0 ]; then
    streamlink --stdout https://www.showroom-live.com/r/${room} best | ffmpeg -i - -c copy ${work_dir}/${file_name} > /dev/null && \
    mv ${work_dir}/${file_name} ${save_path}/${file_name} &
  fi
fi
