import { Request, Response } from "express";
import { getCollection, getDocument } from "../database";
import { DbUser } from "../types";

export async function onUserGet(req: Request, res: Response) {
    const id = req.params["id"];
    if (!id) { res.status(400).send("Missing id route parameter"); }
    const data = await getDocument<DbUser>(`users/${id}`);
    res.json(data);
}

export async function onUsersGet(req: Request, res: Response) {
    const data = await getCollection<DbUser>(`users`);
    res.json(data);
}
