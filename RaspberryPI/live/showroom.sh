#!/bin/bash

live_check() {
  curl -s "https://www.showroom-live.com/api/room/status?room_url_key=${room}" | python -m json.tool > /tmp/${timestamp}_${room}.json
  ret=$(cat /tmp/${timestamp}_${room}.json | jq 'if .is_live then 1 else 0 end')

  # 配信判定
  if [ $ret -eq 1 ]; then
    # きっかけ配信判定
    code=$(cat /tmp/${timestamp}_${room}.json | jq 'if .live_type == 4 then 2 else 1 end')

    # 配信中ならJSONを移動する
    mv /tmp/${timestamp}_${room}.json log/${timestamp}_${room}.json
  else
    code=0
  fi

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
  live_check
  code=$?

  if [ $code -gt 0 ]; then
	  # 配信開始なら、配信通知
    ret=$(grep 'live_id' | grep ${live_id} | wc -l)
    if [ $ret -eq 0 ]; then
  	  curl -v -G "http://iot-main.local:1880/live?live=${code}&site=sr" --data-urlencode "name=${name}" >> log/showroom_curl_$(date "+%Y%m%d").log 2>&1
    fi

    # 保存開始
	  ROOM_URL=https://www.showroom-live.com/r/${room}
    live_id=$(cat log/${timestamp}_${room}.json | jq '.live_id')
    echo "${file_name} save start ${live_id}" >> log/live_$(date "+%Y%m%d").log
  	streamlink -o ${work_dir}/${file_name}.ts $ROOM_URL best
    echo "${file_name} save end" >> log/live_$(date "+%Y%m%d").log

    # 配信が終了しているか確認
    timestamp=$(date "+%Y%m%d_%H%M%S")
    file_name=${timestamp}_${name}
    live_check
    code=$?

    while [ $code -gt 0 ];
    do
      live_id=$(cat log/${timestamp}_${room}.json | jq '.live_id')
      echo "${file_name} save start ${live_id} resume" >> log/live_$(date "+%Y%m%d").log
  	  streamlink -o ${work_dir}/${file_name}.ts $ROOM_URL best
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
      if [ $(ls -1 ${work_dir}/*.ts 2> /dev/null | grep ${name} | wc -l) -ne 0 ]; then
        # 配信ファイルの結合用のリストを作成する
        ls -1 ${work_dir}/*.ts | grep ${name} | while read -r filename; do
          echo "file '${filename}'" >> ${work_dir}/log/list_${timestamp}.txt
        done
      fi
        # 先頭のファイル名を取得
        MP4_FILE=$(basename $(ls -1 ${work_dir}/*.ts | grep ${name} | head -1 | sed 's/\.ts$//').mp4)
        # 配信ファイルを結合する
        ffmpeg -f concat -safe 0 -i ${work_dir}/log/list_${timestamp}.txt -c copy ${work_dir}/${MP4_FILE}
        if [ $? -eq 0 ]; then
          # 結合が成功すれば、OneDiriveに移動して、tsファイルはバックアップに移動する
    	  	mv ${work_dir}/${MP4_FILE} ${save_path}/${MP4_FILE}
          mv ${work_dir}/${MP4_FILE}/*_${name}.ts ${MP4_FILE}/ts/
          echo "${MP4_FILE} sucess" >> log/encode_$(date "+%Y%m%d").log
        else
          echo "${MP4_FILE} fail" >> log/encode_$(date "+%Y%m%d").log
        fi
    fi
  fi
fi
