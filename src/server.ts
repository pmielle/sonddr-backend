import express from "express";
import expressWs from "express-ws";
import dotenv from "dotenv";
import cors from "cors";
import { MemoryStore } from "express-session";
import { makeSession } from "./session";
import { getAuthClient, getAuthMiddleware, getAuthProtection, getFetchUserIdMiddleware, getWsProtection } from "./authentication";
import { onNotificationConnection } from "./handlers/notifications";
import { onDiscussionConnection, onDiscussionPost } from "./handlers/discussions";
import { genericGetDocumentHandler, genericGetCollectionHandler } from "./handlers/generics";
import { onUserPost } from "./handlers/users";

// environment
// --------------------------------------------
dotenv.config({path: ".env.dev"});

// main app
// --------------------------------------------
const expressApp = express();
const app = expressWs(expressApp).app;
app.use(express.json());
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
const fetchUserId = getFetchUserIdMiddleware(authClient);

// routes
// --------------------------------------------
// users
app.get("/users/:id", httpProtection, genericGetDocumentHandler);
app.get("/users", httpProtection, genericGetCollectionHandler);
app.post("/users", httpProtection, fetchUserId, onUserPost);
// goals
app.get("/goals", httpProtection, genericGetCollectionHandler);
// notifications
app.ws("/notifications", wsProtection, onNotificationConnection);
// discussions
app.post("/discussions", httpProtection, fetchUserId, onDiscussionPost);
app.ws("/discussions", wsProtection, onDiscussionConnection);


// start
// --------------------------------------------
const port = process.env["EXPRESS_PORT"];
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
