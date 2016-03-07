FROM ubuntu:14.04.4

ADD ./emdebian-toolchain-archive.key .

RUN apt-get install -y curl && \
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
		qemu-user

RUN mkdir /lea

RUN npm install -g tsd
RUN npm install -g gulp-cli

WORKDIR /lea

ADD package.json ./
RUN npm install

RUN npm install -g typings

ADD entrypoint.sh /
RUN chmod +x /entrypoint.sh

ADD typings.json ./
RUN typings install

ADD gulpfile.js ./
ADD tsconfig.json ./
ADD karma.conf.js ./
ADD karma-test-shim.js ./

ADD src/ src/

RUN gulp

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
