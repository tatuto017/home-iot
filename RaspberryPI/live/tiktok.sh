#!/bin/bash

live_check() {
  python tiktok.py ${room}
  code=$(cat /tmp/${room}.json | jq 'if .is_live then 1 else 0 end')

  return $code
}

cd "$(dirname "$0")"
. ./bin/activate

room=${1}
name=${2}
work_dir=$(pwd)
save_path=/home/tatuto/OneDrive/ShowRoom
timestamp=$(date "+%Y%m%d_%H%M%S")
file_name=${timestamp}_${name}

record=$(ps -ef | grep streamlink | grep $room | grep -v grep | wc -l)
if [ $record -eq 0 ]; then
  live_check $room
  code=$?

  if [ $code -eq 1 ]; then
	  # 配信開始なら、配信通知
	  curl -v -G "http://iot-main.local:1880/live?live=${code}&site=tiktok" --data-urlencode "name=${2}" >> log/showroom_curl_$(date "+%Y%m%d").log 2>&1

    # 保存開始
	  ROOM_URL="https://www.tiktok.com/@${room}/live"
    echo "${file_name} save start" >> log/tiktok_$(date "+%Y%m%d").log
  	streamlink -o ${file_name}.ts $ROOM_URL best
    echo "${file_name} save end" >> log/tiktok_$(date "+%Y%m%d").log

    # 配信が終了しているか確認
    timestamp=$(date "+%Y%m%d_%H%M%S")
    file_name=${timestamp}_${name}
    live_check
    code=$?

    while [ $code -lt 2 ];
    do
      echo "${file_name} save start" >> log/live_$(date "+%Y%m%d").log
  	  streamlink -o ${file_name}.ts $ROOM_URL best
      echo "${file_name} save end" >> log/live_$(date "+%Y%m%d").log

      timestamp=$(date "+%Y%m%d_%H%M%S")
      file_name=${timestamp}_${name}
      live_check
      code=$?
    done

    touch ${room}
  else
    # 配信終了から10分後
    last_live=$(expr $(date "+%s" -r ${room}) + 600)
    # 現在日時
    timestamp=$(date "+%s")
    if [ $timestamp -gt $last_live ]; then
      # 配信ファイルが残っていれば。配信ファイルの結合を開始する
      if [ $(ls -1 *.ts 2> /dev/null | grep ${name} | wc -l) -ne 0 ]; then
        # 配信ファイルの結合用のリストを作成する
        ls -1 *.ts | grep ${name} | while read -r filename; do
          echo "file '../${filename}'" >> log/list_${timestamp}.txt
        done

        # 先頭のファイル名を取得
        MP4_FILE=$(ls -1 *.ts | grep ${name} | head -1 | sed 's/\.ts$//').mp4
        # 配信ファイルを結合する
        ffmpeg -f concat -safe 0 -i log/list_${timestamp}.txt -c copy ${MP4_FILE}
        if [ $? -eq 0 ]; then
          # 結合が成功すれば、OneDiriveに移動して、tsファイルはバックアップに移動する
  	    	mv ${work_dir}/${MP4_FILE} ${save_path}/${MP4_FILE}
          mv *_${name}.ts ts/
          echo "${MP4_FILE} sucess" >> log/encode_$(date "+%Y%m%d").log
        else
          echo "${MP4_FILE} fail" >> log/encode_$(date "+%Y%m%d").log
        fi
      fi
    fi
  fi
fi
