import http from "http";
import internal from "stream";
import { URL } from "url";
import { WebSocketServer } from "ws";
import { getNotifications } from "./database";

const notificationWss = new WebSocketServer({ noServer: true });

export function addRealTimeRoutes(httpServer: http.Server) {
    httpServer.on("upgrade", (req, socket, head) => {
        const url = getUrlFromReq(req);
        const route = url.pathname;
        switch(route) {
            case "/notifications": {
                handleUpgrade(notificationWss, req, socket, head);
                break;
            }
            default: {
                socket.destroy(new Error(`Unexpected route: ${route}`));
            }
        }
    });
}

// private
// --------------------------------------------
function handleUpgrade(wss: WebSocketServer, req: http.IncomingMessage, socket: internal.Duplex, head: Buffer) {
    wss.handleUpgrade(req, socket, head, (socket) => {
        wss.emit("connection", socket, req);
    });
}

notificationWss.on("connection", (socket, req) => {
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
});

function getUrlFromReq(req: http.IncomingMessage): URL {
    return new URL(req.url, `http://${req.headers.host}`);
}
