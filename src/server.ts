import express from "express";
import { getGoals } from "./database";
import { getAuthClient, getAuthMiddleware, getAuthProtection, getWsProtection } from "./authentication";
import { MemoryStore } from "express-session";
import { makeSession } from "./session";
import cors from "cors";
import dotenv from "dotenv";
import expressWs from "express-ws";
import { onNotificationConnection } from "./handlers/notifications";
import { onDiscussionConnection } from "./handlers/discussions";

dotenv.config({path: ".env.dev"});

const expressApp = express();

const app = expressWs(expressApp).app;

const store = new MemoryStore();
const session = makeSession(store);
app.use(session);  // must be done before using auth middleware

app.use(cors({origin: "http://localhost:4200"}));

const authClient = getAuthClient(store);
app.use(getAuthMiddleware(authClient));
const httpProtection = getAuthProtection(authClient);
const wsProtection = getWsProtection(authClient);

app.get("/goals", httpProtection, async (req, res) => {
    let goals = await getGoals();
    res.json(goals);
});

app.ws("/notifications", wsProtection, onNotificationConnection);

app.ws("/discussions", wsProtection, onDiscussionConnection);

const port = process.env["EXPRESS_PORT"];
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
