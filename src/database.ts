import { ChangeStreamDeleteDocument, ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamOptions, ChangeStreamUpdateDocument, Document, MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { Observable, from, switchMap } from "rxjs";

dotenv.config({ path: ".env.dev" });

const uri = process.env["MONGODB_CONNECTION_STRING"];

const client = new MongoClient(uri);
const db = client.db();

export async function deleteDocument(path: string) {
    const [collectionId, documentId] = parseDocumentPath(path);
    await db.collection(collectionId).deleteOne({_id: new ObjectId(documentId)});
    return;
}

export async function postDocument(path: string, payload: any) {
    if (payload["_id"] === undefined) { throw new Error("Payload is missing an _id"); }
    await db.collection(path).insertOne(payload);
    return;
}

export async function getDocument<T>(path: string): Promise<T> {
    const [collectionId, documentId] = parseDocumentPath(path);
    const data: T = await db.collection(collectionId).findOne<T>({"_id": new ObjectId(documentId)});
    return data;
}

export async function getCollection<T>(path: string): Promise<T[]> {
    const data: T[] = await db.collection(path).find<T>({}).toArray();
    return data;
}

export function streamCollection<T>(path: string, pipeline: Document[] = []): Observable<T[]> {
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

// private
// --------------------------------------------
function parseDocumentPath(path: string): [string, string] {
    const pathFragments = path.split("/");
    if (pathFragments.length != 2) { throw new Error(`Document path ${path} does not have 2 fragments`); }
    const [collectionId, documentId] = pathFragments;
    return [collectionId, documentId];
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
