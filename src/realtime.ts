import http from "http";
import { URL } from "url";
import { WebSocket } from "ws";
import { Observable } from "rxjs";

export function streamToWebsocket(obs: Observable<any>, ws: WebSocket) {
    obs.subscribe({
        next: (data) => {
            ws.send(JSON.stringify(data));
        },
        error: (error) => {
            ws.close(1001, JSON.stringify(error));
        },
        complete: () => {
            ws.close(1000);
        },
    });
}

export function getUrlFromReq(req: http.IncomingMessage): URL {
    return new URL(req.url, `http://${req.headers.host}`);
}
