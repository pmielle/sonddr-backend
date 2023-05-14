import express from "express";
import { getGoals } from "./database";
import { getAuthClient, getAuthMiddleware, getAuthProtection } from "./authentication";
import { MemoryStore } from "express-session";
import { makeSession } from "./session";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import ws from "ws";
import { addRealTimeRoutes } from "./realtime";

dotenv.config({path: ".env.dev"});

const app = express();

const store = new MemoryStore();
const session = makeSession(store);
app.use(session);  // must be done before using auth middleware

app.use(cors({origin: "http://localhost:4200"}));

const authClient = getAuthClient(store);
app.use(getAuthMiddleware(authClient));

app.get("/goals", getAuthProtection(authClient), async (req, res) => {
    let goals = await getGoals();
    res.json(goals);
});

const httpServer = http.createServer(app);
addRealTimeRoutes(httpServer);

const port = process.env["EXPRESS_PORT"];
httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
