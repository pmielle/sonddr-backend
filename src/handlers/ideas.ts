import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getFromReqBody, getReqUserId } from "./generics";
import { DbIdea } from "../types";
import { postDocument } from "../database";

export async function onIdeaPost(req: Request, res: Response) {
    // build
    const id = uuid();
    const title = getFromReqBody("title", req, true);
    const authorId = getReqUserId(req);
    const idea: DbIdea = {_id: id, title: title, authorId: authorId, votes: 0};
    // post
    await postDocument("ideas", idea);
    // respond
    res.status(200).send();
    return;
}