import express from "express"; 

const app = express();
const port = 3000;

app.get("/goals", (req, res) => {
    console.log("helloooo");
    
    res.json([
        { id: "goal_id", name: "Goal Name" },
    ]);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
