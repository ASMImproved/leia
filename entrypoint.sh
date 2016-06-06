#! /bin/bash

export DISPLAY=:99
export MIPS_IMAGE_NAME=asmimpoved/mips

echo 'Pulling image $MIPS_IMAGE_NAME before the server starts'
curl --version
curl -XPOST --unix-socket /var/run/docker.sock http:/images/create?fromImage=$MIPS_IMAGE_NAME

cd /leia

if [ "$1" == "test" ]; then
    Xvfb $DISPLAY -screen 0 1024x768x24 -fbdir /var/run -ac > /dev/null 2>&1 &

	result=0
    npm run test-client; result=$((result+$?))
    gulp test_server; result=$((result+$?))
    exit $result
elif [ "$1" == "watch" ]; then
    Xvfb $DISPLAY -screen 0 1024x768x24 -fbdir /var/run -ac > /dev/null 2>&1 &

    gulp watch
else
    node dist/server/main.js
fi
