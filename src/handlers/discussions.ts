import http from "http";
import { WebSocket } from "ws";
import { getUrlFromReq, streamToWebsocket } from "../realtime";
import { postDocument, streamCollection } from "../database";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getFromReqBody, getReqUserId } from "./generics";
import { DbDiscussion } from "../types";

export function onDiscussionPost(req: Request, res: Response) {
    // build 
    const id = uuid();
    const userIds: string[] = getFromReqBody("userIds", req, true);
    userIds.push(getReqUserId(req));
    const discussion: DbDiscussion = {_id: id, userIds: userIds};
    // post
    postDocument("discussions", discussion);
    // respond
    res.status(200).send();
}

export function onDiscussionConnection(socket: WebSocket, req: http.IncomingMessage) {
    const idKey = "userId";
    const url = getUrlFromReq(req);
    const userId = url.searchParams.get(idKey);
    if (!userId) {
        socket.close(1001, `${idKey} not found in query params`);
    }
    streamToWebsocket(streamCollection("discussions"), socket);
}