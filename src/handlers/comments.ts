import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getFromReqBody, getReqUserId } from "./generics";
import { deleteDocument, postDocument } from "../database";
import { DbComment } from "../types";
import { getDocument } from "../database";

export async function onCommentDelete(req: Request, res: Response) {
    // a comment can only be deleted by its author
    const id = getFromReqBody("id", req, true);
    const authorId = (await getDocument<DbComment>(`comments/${id}`)).authorId;
    if (authorId !== getReqUserId(req)) {
        res.status(403).send(`A comment can only be deleted by its author`);
        return;
    } 
    // delete
    await deleteDocument(`comments/${id}`);
    // respond
    res.status(200).send();
    return;
}

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
    await postDocument("comments", comment);
    // respond
    res.status(200).send();
    return;
}