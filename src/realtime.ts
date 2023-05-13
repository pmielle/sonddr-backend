import http from "http";
import internal from "stream";
import { URL } from "url";
import ws from "ws";
import { getNotifications } from "./database";

const wsServer = new ws.WebSocketServer({ noServer: true });

export function addRealTimeRoutes(httpServer: http.Server) {
    httpServer.on("upgrade", (req, socket, head) => {
        const route = getRouteFromUrl(req.url);
        switch(route) {
            case "/notifications": {
                onNotificationsUpgrade(req, socket, head);
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
function onNotificationsUpgrade(req: http.IncomingMessage, socket: internal.Duplex, head: Buffer) {
    const idKey = "userId";
    const userId = getQueryParamFromUrl(req.url, idKey);
    if (!userId) {
        socket.destroy(new Error(`${idKey} not found in query params`));
    }
    wsServer.handleUpgrade(req, socket, head, (socket) => {
        getNotifications(userId).subscribe({
            next: (notifications) => socket.send(notifications),
            error: (error) => socket.close(1001, error),
            complete: () => socket.close(1000),
        });
    });
}

function getRouteFromUrl(url: string): string {
    const urlObj = new URL(url);
    const route = urlObj.pathname;
    return route;
}

function getQueryParamFromUrl(url: string, key: string): string {
    const urlObj = new URL(url);
    const value = urlObj.searchParams.get(key);
    return value;
}
