import { Request, Response } from "express";
import { DbUser } from "../types";
import { getFromReqBody } from "./generics";
import { postDocument } from "../database";

export function onUserPost(req: Request, res: Response) {
    const id = getFromReqBody("_id", req, true);
    const name = getFromReqBody("name", req, true);
    const user: DbUser = {_id: id, name: name};
    postDocument("users", user);
    res.status(200).send();
}