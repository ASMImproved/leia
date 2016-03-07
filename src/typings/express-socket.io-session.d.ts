import express = require("express");

declare interface Callback {
    (error?: any): void;
}

declare interface SocketMiddleware {
    (socket: SocketIO.Socket, callback: Callback);
}

declare function expressSocketioSession(config : express.RequestHandler) : SocketMiddleware;

export = expressSocketioSession