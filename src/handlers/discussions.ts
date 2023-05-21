import http from "http";
import { WebSocket } from "ws";
import { getUrlFromReq, streamToWebsocket } from "../realtime";
import { getDiscussions } from "../database";

export function onDiscussionConnection(socket: WebSocket, req: http.IncomingMessage) {
    const idKey = "userId";
    const url = getUrlFromReq(req);
    const userId = url.searchParams.get(idKey);
    if (!userId) {
        socket.close(1001, `${idKey} not found in query params`);
    }
    streamToWebsocket(getDiscussions(userId), socket);
}