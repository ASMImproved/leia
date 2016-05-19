# Lea

A web-based Assembler IDE leveraging QEMU as a runtime.

[![Circle CI](https://circleci.com/gh/ASMImproved/lea/tree/master.svg?style=svg)](https://circleci.com/gh/ASMImproved/lea/tree/master)

Docker Image: https://hub.docker.com/r/asmimproved/lea/

## Progress

This project is still in development. Use with care!

## Usage

Requires: Docker

Run ` docker run -p 80:80 -v /var/run/docker.sock:/var/run/docker.sock asmimproved/lea`

Open `http://[docker-machine]` in your browser

## Build instructions (only required for development)

The server is intended to run in a Docker container.

Run `docker build -t lea .` inside the root folder of this repository.

The container exposes the UI on HTTP Port 80.
