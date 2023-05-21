import express from "express";
import expressWs from "express-ws";
import dotenv from "dotenv";
import cors from "cors";
import { MemoryStore } from "express-session";
import { makeSession } from "./session";
import { getAuthClient, getAuthMiddleware, getAuthProtection, getWsProtection } from "./authentication";
import { onNotificationConnection } from "./handlers/notifications";
import { onDiscussionConnection } from "./handlers/discussions";
import { onGoalsGet } from "./handlers/goals";
import { onUserGet, onUsersGet } from "./handlers/users";

// environment
// --------------------------------------------
dotenv.config({path: ".env.dev"});

// main app
// --------------------------------------------
const expressApp = express();
const app = expressWs(expressApp).app;
app.use(cors({origin: "http://localhost:4200"}));

// session
// --------------------------------------------
const store = new MemoryStore();
const session = makeSession(store);
app.use(session);

// auth
// --------------------------------------------
const authClient = getAuthClient(store);
app.use(getAuthMiddleware(authClient));
const httpProtection = getAuthProtection(authClient);
const wsProtection = getWsProtection(authClient);

// routes
// --------------------------------------------
app.get("/users/:id", httpProtection, onUserGet);
app.get("/users", httpProtection, onUsersGet);
app.get("/goals", httpProtection, onGoalsGet);
app.ws("/notifications", wsProtection, onNotificationConnection);
app.ws("/discussions", wsProtection, onDiscussionConnection);

// start
// --------------------------------------------
const port = process.env["EXPRESS_PORT"];
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
