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
import { onIdeaPost } from "./handlers/ideas";
import { onCommentPost } from "./handlers/comments";

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
// ideas
app.get("/ideas/:id", httpProtection, genericGetDocumentHandler);
app.get("/ideas", httpProtection, genericGetCollectionHandler);
app.post("/ideas", httpProtection, fetchUserId, onIdeaPost);
// comments
app.get("/comments/:id", httpProtection, genericGetDocumentHandler);
app.get("/comments", httpProtection, genericGetCollectionHandler);
app.post("/comments", httpProtection, fetchUserId, onCommentPost);
// users
app.get("/users/:id", httpProtection, genericGetDocumentHandler);
app.get("/users", httpProtection, genericGetCollectionHandler);
app.post("/users", httpProtection, fetchUserId, onUserPost);
// goals
app.get("/goals", httpProtection, genericGetCollectionHandler);
// notifications
app.ws("/notifications", wsProtection, onNotificationConnection);
// discussions
app.ws("/discussions", wsProtection, onDiscussionConnection);
app.post("/discussions", httpProtection, fetchUserId, onDiscussionPost);


// start
// --------------------------------------------
const port = process.env["EXPRESS_PORT"];
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
