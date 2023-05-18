import { ChangeStreamDeleteDocument, ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamOptions, ChangeStreamUpdateDocument, Document, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { DbGoal, DbNotification } from "./types";
import { Observable, from, switchMap } from "rxjs";

dotenv.config({ path: ".env.dev" });

const uri = process.env["MONGODB_CONNECTION_STRING"];

const client = new MongoClient(uri);
const db = client.db();

export async function getGoals(): Promise<DbGoal[]> {
    return getCollection<DbGoal>("goals");
}

export function getNotifications(userId: string): Observable<DbNotification[]> {
    return streamCollection<DbNotification>("notifications");
}

// private
// --------------------------------------------
async function getCollection<T>(path: string): Promise<T[]> {
    const data = await db.collection<T>(path).find({}).toArray();
    return data as T[];
}

function streamCollection<T>(path: string, pipeline: Document[] = []): Observable<T[]> {
    const options: ChangeStreamOptions = { fullDocument: "updateLookup" };
    const changeStream = db.collection<T>(path).watch(pipeline, options);
    const collection$ = from(getCollection<T>(path));  // to avoid promise<observable>
    return collection$.pipe(switchMap((value) => {
        return new Observable<T[]>((subscriber) => {
            subscriber.next(value);
            changeStream.on("change", (change) => {
                handleChange(change, value);  // mutates value
                subscriber.next(value);
            });
            changeStream.on("error", (error) => {
                subscriber.error(error);
            });
            changeStream.on("end", () => {
                subscriber.complete();
            })
            return () => changeStream.close()  // called when client unsubscribes
        });
    }));
}

function handleChange<T>(change: ChangeStreamDocument<T>, value: T[]) {
    switch (change.operationType) {
        case "insert": {
            handleInsertChange(change, value);  // mutates value
            break;
        }
        case "delete": {
            handleDeleteChange(change, value);  // mutates value
            break;
        }
        case "update": {
            handleUpdateChange(change, value); // mutates value
            break;
        }
    }
}

function handleInsertChange<T>(change: ChangeStreamInsertDocument<T>, value: T[]) {
    value.push(change.fullDocument);
}

function handleDeleteChange<T>(change: ChangeStreamDeleteDocument<T>, value: T[]) {
    const idToRemove = change.documentKey._id;
    const index = value.findIndex((doc => doc["_id"] === idToRemove));
    value.splice(index, 1);
}

function handleUpdateChange<T>(change: ChangeStreamUpdateDocument<T>, value: T[]) {
    const idToReplace = change.documentKey._id;
    const index = value.findIndex((doc) => doc["_id"] === idToReplace);
    value[index] = change.fullDocument;
}
