import { Request, Response } from "express";
import { getFromReqBody, getReqUserId } from "./generics";
import { DbCommentVote } from "../types";
import { deleteDocument, getDocument, postDocument } from "../database";

export async function onCommentVoteDelete(req: Request, res: Response) {
    const commentId = getFromReqBody("commentId", req, true);
    const fromId = getReqUserId(req);
    const id = `${commentId}-${fromId}`;
    // delete
    await deleteDocument(`comment-votes/${id}`);
    // respond
    res.status(200).send();
    return;
}

export async function onCommentVotePost(req: Request, res: Response) {
    // build
    const commentId = getFromReqBody("commentId", req, true);
    const fromId = getReqUserId(req);
    const value = getFromReqBody("value", req, true);
    const id = `${commentId}-${fromId}`;
    const commentVote: DbCommentVote = {_id: id, commentId: commentId, fromId: fromId, value: 1};
    // check the value
    if (! [-1, 1].includes(commentVote.value)) {
        res.status(400).send("Value must be -1 or 1");
        return;
    }
    // make sure the comment exists
    if (! await getDocument(`comment/${commentVote.commentId}`)) {
        res.status(400).send(`Comment ${commentVote.commentId} not found`);
        return;
    }
    // post
    await postDocument("comment-votes", commentVote);
    // respond
    res.status(200).send();
    return;
}