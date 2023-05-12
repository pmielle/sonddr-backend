import express from "express";
import { getGoals } from "./database";
import { getAuthClient, getAuthMiddleware, getAuthProtection } from "./authentication";
import { MemoryStore } from "express-session";
import { makeSession } from "./session";
import cors from "cors";

const app = express();
const port = 3000;

const store = new MemoryStore();

const session = makeSession(store);
app.use(session);  // must be done before using auth middleware

const authClient = getAuthClient(store);
app.use(getAuthMiddleware(authClient));

app.use(cors({origin: "http://localhost:4200"}));

app.get("/goals", getAuthProtection(authClient), async (req, res) => {
    let goals = await getGoals();
    res.json(goals);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
