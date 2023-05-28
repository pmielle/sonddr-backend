import { ChangeStreamDocument } from "mongodb";
import { DbComment, DbCommentVote } from "../types";
import { updateDocument } from "../database";

export async function onCommentVoteChange(change: ChangeStreamDocument<DbCommentVote>) {
    switch (change.operationType) {
        case "insert": {
            const commentId = change.fullDocument.commentId;
            updateDocument<DbComment>(`comments/${commentId}`, {$inc: {votes: change.fullDocument.value}});
            break;
        }
        case "delete": {
            const commentId = change.documentKey._id;
            updateDocument<DbComment>(`comments/${commentId}`, {$inc: {votes: -1 * change.fullDocumentBeforeChange.value}});
            break;
        }
        case "update": {
            const commentId = change.fullDocument._id;
            const valueDiff = change.fullDocument.value - change.fullDocumentBeforeChange.value;
            if (!valueDiff) { break; }
            updateDocument<DbComment>(`comments/${commentId}`, {$inc: {votes: valueDiff}})
            break;
        }
    }
}