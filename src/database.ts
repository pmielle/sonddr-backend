import { ChangeStreamDeleteDocument, ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamOptions, ChangeStreamUpdateDocument, Document, Filter, FindOptions, MongoClient, ObjectId, UpdateFilter } from "mongodb";
import dotenv from "dotenv";
import { Observable, from, switchMap } from "rxjs";

dotenv.config({ path: ".env.dev" });

const uri = process.env["MONGODB_CONNECTION_STRING"];

const client = new MongoClient(uri);
const db = client.db();

export async function updateDocument<T>(path: string, payload: UpdateFilter<T> | Partial<T>) {
    const [collectionId, documentId] = parseDocumentPath(path);
    await db.collection(collectionId).updateOne({ _id: new ObjectId(documentId) }, payload);
    return;
}

export async function deleteDocument(path: string) {
    const [collectionId, documentId] = parseDocumentPath(path);
    await db.collection(collectionId).deleteOne({ _id: new ObjectId(documentId) });
    return;
}

export async function postDocument(path: string, payload: any) {
    if (payload["_id"] === undefined) { throw new Error("Payload is missing an _id"); }
    await db.collection(path).insertOne(payload);
    return;
}

export async function getDocument<T>(path: string): Promise<T> {
    const [collectionId, documentId] = parseDocumentPath(path);
    const data: T = await db.collection(collectionId).findOne<T>({ "_id": new ObjectId(documentId) });
    return data;
}

export async function findDocument<T>(path: string, filter: Filter<T>): Promise<T> {
    const data: T = await db.collection(path).findOne<T>(filter);
    return data;
}

export async function getCollection<T>(path: string, filter: Filter<T> = {}, options: FindOptions = {}): Promise<T[]> {
    const data: T[] = await db.collection(path).find<T>(filter, options).toArray();
    return data;
}

export function watchCollection<T>(path: string, pipeline: Document[] = [], options: ChangeStreamOptions = { fullDocument: "updateLookup", fullDocumentBeforeChange: "whenAvailable" }): Observable<ChangeStreamDocument<T>> {
    return new Observable((subscriber) => {
        const watchSub = db.collection<T>(path).watch(pipeline, options).on('change', change => subscriber.next(change));
        return () => watchSub.close();
    });
}

export function streamCollection<T>(path: string, filter: Filter<T> = {}): Observable<T[]> {
    const watchPipeline = filterToWatchPipeline(filter);
    const collection$ = from(getCollection<T>(path, filter));
    return collection$.pipe(
        switchMap((value) => {
            // value contains the current collection and will be emitted immediately
            // then, upon database change, it will be updated (in-place) and emitted
            return new Observable<T[]>((subscriber) => {
                subscriber.next(value);  // emit the first value immediately
                const watchSub = watchCollection<T>(path, watchPipeline).subscribe({
                    next: (change) => {
                        handleChange(change, value);  // mutates value
                        subscriber.next(value);
                    },
                    error: (error) => subscriber.error(error),
                    complete: () => subscriber.complete(),
                });
                return () => watchSub.unsubscribe()  // called when client unsubscribes
            });
        })
    )
}

// private
// --------------------------------------------
function filterToWatchPipeline<T>(filter: Filter<T>): Document[] {
    const fullDocumentMatch = {};
    const fullDocumentBeforeChangeMatch = {};
    for (const [key, value] of Object.entries(filter)) {
        fullDocumentMatch[`fullDocument.${key}`] = value;
        fullDocumentBeforeChangeMatch[`fullDocumentBeforeChange.${key}`] = value;
    }
    return [ { $match: { $or: [ fullDocumentMatch, fullDocumentBeforeChangeMatch] } } ];    

}

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
    const index = value.findIndex((doc => idToRemove.equals(doc["_id"])));
    if (index < 0) { return; }
    value.splice(index, 1);
}

function handleUpdateChange<T>(change: ChangeStreamUpdateDocument<T>, value: T[]) {
    const idToReplace = change.documentKey._id;
    const index = value.findIndex((doc) => idToReplace.equals(doc["_id"]));
    value[index] = change.fullDocument;
}
