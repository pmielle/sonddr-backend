import { Request, Response } from "express";
import { getReqUserId } from "./generics";
import { getFromReqBody } from "./generics";
import { DbIdeaVote } from "../types";
import { deleteDocument, getDocument, postDocument } from "../database";

export async function onIdeaVoteDelete(req: Request, res: Response) {
    // a vote can only be deleted by its author
    const ideaId = getFromReqBody("ideaId", req, true);
    const fromId = getReqUserId(req);
    const id = `${ideaId}-${fromId}`;
    // make sure the idea exists
    if (! await getDocument(`ideas/${ideaId}`)) {
        res.status(400).send(`Idea ${ideaId} not found`);
        return;
    }
    // delete
    await deleteDocument(`idea-votes/${id}`);
    // respond
    res.status(200).send();
    return;
}

export async function onIdeaVotePost(req: Request, res: Response) {
    // build
    const ideaId = getFromReqBody("ideaId", req, true);
    const fromId = getReqUserId(req);
    const id = `${ideaId}-${fromId}`;
    const ideaVote: DbIdeaVote = {_id: id, ideaId: ideaId, fromId: fromId};
    // make sure the idea exists
    if (! await getDocument(`ideas/${ideaId}`)) {
        res.status(400).send(`Idea ${ideaId} not found`);
        return;
    }
    // post
    await postDocument("idea-votes", ideaVote);
    // respond
    res.status(200).send();
    return;
}