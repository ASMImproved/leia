#! /bin/bash

export DISPLAY=:99

cd /lea

if [ "$1" == "test" ]; then
    Xvfb $DISPLAY -screen 0 1024x768x24 -fbdir /var/run -ac &

    gulp test_client
    gulp test_server
elif [ "$1" == "watch" ]; then
    Xvfb $DISPLAY -screen 0 1024x768x24 -fbdir /var/run -ac &

    gulp watch
else
    node dist/server/main.js
fi
