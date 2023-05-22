import { Request, Response } from "express";
import { DbUser } from "../types";
import { getFromReqBody, getReqUserId } from "./generics";
import { postDocument } from "../database";

export function onUserPost(req: Request, res: Response) {
    // build 
    const id = getFromReqBody("_id", req, true);
    const name = getFromReqBody("name", req, true);
    const user: DbUser = {_id: id, name: name};
    // authorize
    if (user._id !== getReqUserId(req)) {
        res.status(403).send();
        return;
    }
    // post
    postDocument("users", user);
    // respond
    res.status(200).send();
}
