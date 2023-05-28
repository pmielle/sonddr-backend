import { ChangeStreamDocument } from "mongodb";
import { DbIdea, DbIdeaVote } from "../types";
import { updateDocument } from "../database";

export function onIdeaVoteChange(change: ChangeStreamDocument<DbIdeaVote>) {
    switch (change.operationType) {
        case "insert": {
            const ideaId = change.fullDocument.ideaId;
            updateDocument<DbIdea>(`idea-votes/${ideaId}`, {$inc: {votes: 1}});
            break;
        }
        case "delete": {
            const ideaId = change.documentKey._id;
            updateDocument<DbIdea>(`idea-votes/${ideaId}`, {$inc: {votes: -1}});
            break;
        }
    }
}