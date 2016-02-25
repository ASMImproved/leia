# Lea

A web-based Assembler IDE leveraging QEMU as a runtime.

[![Circle CI](https://circleci.com/gh/ASMImproved/lea/tree/master.svg?style=svg)](https://circleci.com/gh/ASMImproved/lea/tree/master)

## Build instructions

The server is intended to run in a Docker container.

Run `docker build -t lea .` inside the root folder of this repository.

The container exposes the UI on HTTP Port 80.
