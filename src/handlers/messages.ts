import http from "http";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getFromReqBody, getReqUserId } from "./generics";
import { getDocument, postDocument, streamCollection } from "../database";
import { DbDiscussion, DbMessage } from "../types";
import { getUrlFromReq, streamToWebsocket } from "../realtime";
import { WebSocket } from "ws";

export async function onMessagePost(req: Request, res: Response) {
    // build
    const id = uuid();
    const fromUser = getReqUserId(req);
    const discussionId = getFromReqBody("discussionId", req, true);
    const content = getFromReqBody("content", req, true);
    const message: DbMessage = {_id: id, discussionId: discussionId, fromUser: fromUser, content: content, timestamp: new Date()};
    // check that this user is in the discussion
    const discussion = await getDocument<DbDiscussion>(`discussions/${message.discussionId}`);
    if (! discussion.userIds.includes(message.fromUser)) {
        res.status(400).send(`User is not in discussion`);
        return;
    }
    // post
    await postDocument("messages", message);
    // respond
    res.status(200).send();
}

export function onMessageConnection(socket: WebSocket, req: http.IncomingMessage) {
    const idKey = "discussionId";
    const url = getUrlFromReq(req);
    const discussionId = url.searchParams.get(idKey);
    if (!discussionId) {
        socket.close(1001, `${idKey} not found in query params`);
    }
    streamToWebsocket(streamCollection<DbMessage>("messages"), socket);
}