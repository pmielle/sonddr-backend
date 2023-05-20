import express from "express";
import { getGoals } from "./database";
import { getAuthClient, getAuthMiddleware, getAuthProtection, protectWs } from "./authentication";
import { MemoryStore } from "express-session";
import { makeSession } from "./session";
import cors from "cors";
import dotenv from "dotenv";
import expressWs from "express-ws";
import { onNotificationConnection } from "./realtime";

dotenv.config({path: ".env.dev"});

const expressApp = express();

const app = expressWs(expressApp).app;

const store = new MemoryStore();
const session = makeSession(store);
app.use(session);  // must be done before using auth middleware

app.use(cors({origin: "http://localhost:4200"}));

const authClient = getAuthClient(store);
app.use(getAuthMiddleware(authClient));
const protectHttp = authClient.protect();

app.get("/goals", protectHttp, async (req, res) => {
    let goals = await getGoals();
    res.json(goals);
});

app.ws("/notifications", protectWs, (socket, req) => {
    onNotificationConnection(socket, req);
})

const port = process.env["EXPRESS_PORT"];
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
