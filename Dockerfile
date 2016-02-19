FROM ubuntu:14.04.4

RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_4.x | bash - && \
    apt-cache showpkg nodejs && \
    apt-get install -y nodejs build-essential

RUN mkdir /lea

RUN npm install -g tsd
RUN npm install -g gulp-cli

WORKDIR /lea

ADD package.json .
RUN npm install

RUN npm install -g typings

ADD entrypoint.sh /
RUN chmod +x /entrypoint.sh

ADD typings.json .
RUN typings install

ADD gulpfile.js .
ADD tsconfig.json .
ADD karma.conf.js .
ADD karma-test-shim.js .

ADD src/ src/

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]