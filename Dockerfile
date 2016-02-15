FROM node:5.5.0-wheezy

RUN mkdir /lea

RUN npm install -g tsd
RUN npm install -g gulp-cli

WORKDIR /lea

# install dev dependencies
RUN npm install \
    concurrently@^1.0.0 \
    gulp@^3.9.1 \
    gulp-connect@^2.2.0 \
    gulp-open@^1.0.0 \
    gulp-plumber@^1.0.1 \
    gulp-rimraf@^0.2.0 \
    gulp-sass@^2.1.0 \
    gulp-sourcemaps@^1.6.0 \
    gulp-typescript@^2.10.0 \
    jasmine-core@2.4.1 \
    tsd@^0.6.5 \
    typescript@^1.7.5 \
    run-sequence@^1.1.5 \
    gulp-sass@2.2.0

# install dependencies
RUN npm install \
    express@^4.13.4 \
    socket.io@^1.4.4 \
    angular2@2.0.0-beta.3 \
    systemjs@0.19.6 \
    es6-promise@3.0.2 \
    es6-shim@0.33.3 \
    reflect-metadata@0.1.2 \
    rxjs@5.0.0-beta.0 \
    zone.js@0.5.11

ADD entrypoint.sh /
RUN chmod +x /entrypoint.sh

ADD gulpfile.js .
ADD tsconfig.json .

ADD src/ src/

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]