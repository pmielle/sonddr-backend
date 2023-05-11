import session, { MemoryStore } from "express-session";
import dotenv from "dotenv";

export function getMemoryStore(): MemoryStore {
    return new session.MemoryStore();
}

export function makeSession(store: MemoryStore) {
    return session({
        secret: process.env["SESSION_SECRET"],
        resave: false,
        saveUninitialized: true,
        store: store
    })
}