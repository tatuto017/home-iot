#!/bin/bash

# 現在時刻（Unixタイムスタンプ）
now=$(date +%s)

# 指定されたプロセスを抽出し、1行ずつ処理
ps -eo pid,lstart,cmd | grep "showroom_webgl.py" | grep -v "grep" | while read -r pid day month date time year cmd; do
    # lstart形式（例: Sun Feb 22 12:09:47 2026）をUnixタイムスタンプに変換
    start_time=$(date -d "$day $month $date $time $year" +%s 2>/dev/null)
    
    if [ -n "$start_time" ]; then
        # 経過時間（秒）を計算
        elapsed=$(( now - start_time ))
        
        # 300秒（5分）以上経過しているプロセスは落とす
        if [ "$elapsed" -ge 300 ]; then
            kill $pid
        fi
    fi
done
