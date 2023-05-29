import { ChangeStreamDocument } from "mongodb";
import { DbDiscussion, DbMessage } from "../types";
import { getCollection, updateDocument } from "../database";

export async function onMessageChange(change: ChangeStreamDocument<DbMessage>) {
    switch (change.operationType) {
        case "insert": {
            const messageId = change.fullDocument._id;
            const discussionId = change.fullDocument.discussionId;
            updateDocument<DbDiscussion>(`discussions/${discussionId}`, {latestMessageId: messageId});
            break;
        }
        case "delete": {
            const discussionId = change.fullDocumentBeforeChange.discussionId;
            const latestMessages = await getCollection<DbMessage>(`messages`, {}, {sort: {timestamp: -1}, limit: 1});
            if (latestMessages.length > 0) {
                updateDocument<DbDiscussion>(`discussions/${discussionId}`, {latestMessageId: latestMessages[0]._id});
            }
            break;
        }
    }

}