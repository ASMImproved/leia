FROM ubuntu:14.04.4

ADD ./emdebian-toolchain-archive.key .

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsL http://de.archive.ubuntu.com/ubuntu/pool/universe/g/gmp4/libgmp3c2_4.3.2+dfsg-2ubuntu1_amd64.deb -o libgmp3c2_4.3.2+dfsg-1_amd64.deb && \
    dpkg -i /libgmp3c2_4.3.2+dfsg-1_amd64.deb && \
    echo "deb http://www.emdebian.org/debian stable main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-key add emdebian-toolchain-archive.key && \
    apt-get install debian-archive-keyring && \
    curl -sL https://deb.nodesource.com/setup_4.x | bash - && \
    apt-get install -y --force-yes \
	    nodejs \
        build-essential \
        xvfb \
        chromium-browser \
	    cpp-4.3-mips-linux-gnu \
		gcc-4.3-mips-linux-gnu \
		gdb-multiarch \
		git \
		libexif12 \
		python \
		qemu-system-mips \
		qemu-user \
		unzip

RUN mkdir /lea

#RUN npm install -g tsd
RUN npm install -g gulp-cli

WORKDIR /lea

ADD package.json ./
RUN npm install

RUN npm install -g typings@1.0.3

RUN mkdir -p dist/public/vendor/ && \
    curl -sL https://cdn.rawgit.com/ajaxorg/ace-builds/v1.2.0/src-min-noconflict/ace.js -o dist/public/vendor/ace.js && \
    curl -sL https://cdn.rawgit.com/ajaxorg/ace-builds/v1.2.0/src-min-noconflict/mode-c_cpp.js -o dist/public/vendor/mode-c_cpp.js && \
    curl -sL https://github.com/gildas-lormeau/zip.js/tarball/1bead0a -o /zip.js.tar.gz && \
    tar xvzf /zip.js.tar.gz -C / && \
    cp -R /gildas-lormeau-zip.js-1bead0a/WebContent/ dist/public/vendor/zipjs && \
    curl -sL https://github.com/eligrey/FileSaver.js/tarball/683f689 -o /filesave.js.tar.gz && \
    tar xvzf /filesave.js.tar.gz -C / && \
    cp -R /eligrey-FileSaver.js-683f689/ dist/public/vendor/filesaverjs && \
    curl -sL http://fontawesome.io/assets/font-awesome-4.6.3.zip -o /tmp/font-awesome.zip && \
    unzip /tmp/font-awesome.zip -d /tmp/ && \
    cp -R /tmp/font-awesome-4.6.3/ dist/public/vendor/font-awesome

COPY vendor/bootstrap/ dist/public/vendor/bootstrap/

ADD entrypoint.sh /
RUN chmod +x /entrypoint.sh

ADD typings.json ./
ADD src/typings/ src/typings/

RUN typings install

COPY / .

RUN npm run build
RUN gulp

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
