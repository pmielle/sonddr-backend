import { Request, Response } from "express";
import { getReqUserId } from "./generics";
import { getFromReqBody } from "./generics";
import { DbIdeaVote } from "../types";
import { deleteDocument, getDocument, postDocument } from "../database";

export async function onIdeaVoteDelete(req: Request, res: Response) {
    const ideaId = getFromReqBody("ideaId", req, true);
    const fromId = getReqUserId(req);
    const id = `${ideaId}-${fromId}`;
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
    if (! await getDocument(`ideas/${ideaVote.ideaId}`)) {
        res.status(400).send(`Idea ${ideaVote.ideaId} not found`);
        return;
    }
    // post
    await postDocument("idea-votes", ideaVote);
    // respond
    res.status(200).send();
    return;
}