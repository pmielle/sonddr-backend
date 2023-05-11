import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { DbGoal } from "./types";

dotenv.config({path: ".env.dev"});

const mongoUsername = process.env["MONGODB_USERNAME"];
const mongoPassword = process.env["MONGODB_PASSWORD"];
const mongoHost=process.env["MONGODB_HOST"];
const mongoPort=process.env["MONGODB_PORT"];
const mongoDatabase=process.env["MONGODB_DATABASE"];
const uri = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}`;

const client = new MongoClient(uri);
const db = client.db();

export async function getGoals(): Promise<DbGoal[]> {
    return getCollection<DbGoal>("goals");
}

async function getCollection<T>(path: string): Promise<T[]> {
    let data = await db.collection<T>(path).find({}).toArray();
    return data as T[];
}