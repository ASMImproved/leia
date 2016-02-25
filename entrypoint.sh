#! /bin/bash

cd /lea

gulp

if [ "$1" == "test" ]; then
    Xvfb :99 -screen 0 1024x768x24 -fbdir /var/run -ac &

    npm run test_client
    gulp test_server
else
    node dist/server/main.js
fi
