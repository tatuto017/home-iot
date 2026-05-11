import asyncio
import json
import sys
from TikTokLive import TikTokLiveClient


async def check_user(room: str):
    client = TikTokLiveClient(unique_id=room)
    is_live = False
    
    try:
        if await client.is_live():
            is_live = True
            
    except:
        pass
    
    path = f'/tmp/{room}.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({"is_live": is_live}, f)

if __name__ == "__main__":
    room = sys.argv[1]

    asyncio.run(check_user(room))
