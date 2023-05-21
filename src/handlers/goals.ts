import { Request, Response } from "express";
import { getCollection } from "../database";
import { DbGoal } from "../types";

export async function onGoalsGet(req: Request, res: Response) {
    let goals = await getCollection<DbGoal>("goals")
    res.json(goals);
}
