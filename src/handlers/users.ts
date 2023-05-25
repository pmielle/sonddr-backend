import { Request, Response } from "express";
import { DbUser } from "../types";
import { getFromReqBody, getReqUserId } from "./generics";
import { postDocument } from "../database";

export async function onUserPost(req: Request, res: Response) {
    // build 
    const id = getReqUserId(req);
    const name = getFromReqBody("name", req, true);
    const user: DbUser = {_id: id, name: name};
    // post
    await postDocument("users", user);
    // respond
    res.status(200).send();
    return;
}
