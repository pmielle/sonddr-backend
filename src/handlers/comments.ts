import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getFromReqBody, getReqUserId } from "./generics";
import { postDocument } from "../database";
import { DbComment } from "../types";
import { getDocument } from "../database";

export async function onCommentPost(req: Request, res: Response) {
    // build
    const id = uuid();
    const content = getFromReqBody("content", req, true);
    const ideaId = getFromReqBody("ideaId", req, true);
    const authorId = getReqUserId(req);
    const comment: DbComment = {_id: id, content: content, authorId: authorId};
    // make sure the idea exists
    if (! getDocument(`ideas/${ideaId}`)) {
        res.status(400).send(`Idea ${ideaId} not found`);
    }
    // post
    postDocument("comments", comment);
    // respond
    res.status(200).send();
}