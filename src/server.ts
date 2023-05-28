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
import { onCommentDelete, onCommentPost } from "./handlers/comments";
import { onIdeaVoteDelete, onIdeaVotePost } from "./handlers/idea-votes";
import { onCommentVoteDelete, onCommentVotePost, onCommentVotePut } from "./handlers/comment-votes";
import { watchCollection } from "./database";
import { onIdeaVoteChange } from "./triggers/idea-votes";
import { DbCommentVote, DbIdeaVote } from "./types";
import { onCommentVoteChange } from "./triggers/comment-votes";

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


// triggers
// --------------------------------------------
watchCollection<DbIdeaVote>("idea-votes").subscribe(onIdeaVoteChange);
watchCollection<DbCommentVote>("comment-votes").subscribe(onCommentVoteChange);


// routes
// --------------------------------------------
// ideas
app.get("/ideas/:id", httpProtection, genericGetDocumentHandler);
app.get("/ideas", httpProtection, genericGetCollectionHandler);
app.post("/ideas", httpProtection, fetchUserId, onIdeaPost);
// comments
app.get("/comments/:id", httpProtection, genericGetDocumentHandler);
app.delete("/comments/:id", httpProtection, fetchUserId, onCommentDelete);
app.get("/comments", httpProtection, genericGetCollectionHandler);
app.post("/comments", httpProtection, fetchUserId, onCommentPost);
// idea votes
app.get("/idea-votes/:id", httpProtection, genericGetDocumentHandler);
app.delete("/idea-votes/:id", httpProtection, fetchUserId, onIdeaVoteDelete);
app.get("/idea-votes", httpProtection, genericGetCollectionHandler);
app.post("/idea-votes", httpProtection, fetchUserId, onIdeaVotePost);
// comment votes
app.get("/comment-votes/:id", httpProtection, genericGetDocumentHandler);
app.delete("/comment-votes/:id", httpProtection, fetchUserId, onCommentVoteDelete);
app.get("/comment-votes", httpProtection, genericGetCollectionHandler);
app.post("/comment-votes", httpProtection, fetchUserId, onCommentVotePost);
app.put("/comment-votes", httpProtection, fetchUserId, onCommentVotePut);
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
