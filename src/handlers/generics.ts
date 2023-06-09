import { Request, Response } from "express";
import { getCollection, getDocument } from "../database";
import { KcUser } from "../types";

export function getReqUserId(req: Request): string {
    const kcUser: KcUser = (req as any).kcUser;
    return kcUser.id;
}

export async function genericGetDocumentHandler(req: Request, res: Response) {
    const collectionId = getCollectionIdFromReq(req);
    const id = req.params["id"];
    if (!id) { res.status(400).send("Missing id route parameter"); }
    const data = await getDocument(`${collectionId}/${id}`);
    res.json(data);
    return;
}

export async function genericHeadDocumentHandler(req: Request, res: Response) {
    const collectionId = getCollectionIdFromReq(req);
    const id = req.params["id"];
    if (!id) { res.status(400).send("Missing id route parameter"); }
    const data = await getDocument(`${collectionId}/${id}`);
    if (data === null) {
        res.status(200).send();
    } else {
        res.status(404).send();
    }
    return;
}

export async function genericGetCollectionHandler(req: Request, res: Response) {
    const collectionId = getCollectionIdFromReq(req);
    const data = await getCollection(collectionId);
    res.json(data);
    return;
}

export function getFromReqBody(key: string, req: Request, required: boolean = false) {
    const value = req.body[key];
    if (required && value === undefined) {
        throw new Error(`${key} is missing from request body`);
    }
    return value;
}

// private
// --------------------------------------------
function getCollectionIdFromReq(req: Request): string {
    const path = req.path;
    const split = path.split("/");
    if (split.length < 2) { throw new Error(`Failed to get collectionId from path ${path}`); }
    const collectionId = split[1];
    return collectionId;
}
