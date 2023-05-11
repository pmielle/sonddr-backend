import express from "express";
import { getGoals } from "./database";

const app = express();
const port = 3000;

app.get("/goals", async (req, res) => {
    let goals = await getGoals();
    res.json(goals);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
