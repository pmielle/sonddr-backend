import http from "http";
import { URL } from "url";
import { WebSocket } from "ws";
import { getNotifications } from "./database";

export function onNotificationConnection(socket: WebSocket, req: http.IncomingMessage) {
    const idKey = "userId";
    const url = getUrlFromReq(req);
    const userId = url.searchParams.get(idKey);
    if (!userId) {
        socket.close(1001, `${idKey} not found in query params`);
    }
    getNotifications(userId).subscribe({
        next: (notifications) => {
            socket.send(JSON.stringify(notifications));
        },
        error: (error) => {
            socket.close(1001, JSON.stringify(error));
        },
        complete: () => {
            socket.close(1000);
        },
    });
}

// private
// --------------------------------------------
function getUrlFromReq(req: http.IncomingMessage): URL {
    return new URL(req.url, `http://${req.headers.host}`);
}
