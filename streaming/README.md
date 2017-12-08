# Streaming Test 12/6/17

Stream stream HLS stream a camera feed prepared by ffmpeg and served by NGINX.

Start the server:

```
docker-compose up
```

From the `/static` folder:

```
ffmpeg -f avfoundation -r 30 -i "0" -map 0 -f segment -segment_list playlist.m3u8 -segment_list_flags +live -segment_time 1 -strftime 1 "out%FT%H_%M_%SZ.ts"
```

Go to `localhost:8080` in Safari
