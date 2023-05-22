import Keycloak, { KeycloakConfig } from "keycloak-connect";
import dotenv from "dotenv";
import { MemoryStore } from "express-session";
import { Request, RequestHandler, Response } from "express";
import { WebsocketRequestHandler } from "express-ws";
import { KcUser } from "./types";

dotenv.config({ path: ".env.dev" });

const keycloakHost = process.env["KEYCLOAK_HOST"];
const keycloakPort = process.env["KEYCLOAK_PORT"];
const keycloakClientId = process.env["KEYCLOAK_CLIENTID"];
const keycloakRealm = process.env["KEYCLOAK_REALM"];


const config: KeycloakConfig = {
    "auth-server-url": `http://${keycloakHost}:${keycloakPort}`,
    "realm": keycloakRealm,
    "resource": keycloakClientId,
    "ssl-required": "external",
    "confidential-port": 8443
};

export function getFetchUserIdMiddleware(client: Keycloak.Keycloak): RequestHandler {
    return async (req, res, next) => {
        const token = (await client.getGrant(req, res)).access_token;
        const profile = await client.grantManager.userInfo(token);
        const kcUser: KcUser = { id: profile["sub"] };
        req["kcUser"] = kcUser;
        next();
    };
}

export function getAuthClient(store: MemoryStore): Keycloak.Keycloak {
    return new Keycloak({ store: store }, config);
}

export function getAuthMiddleware(client: Keycloak.Keycloak): RequestHandler[] {
    return client.middleware();
}

export function getAuthProtection(client: Keycloak.Keycloak): RequestHandler {
    return client.protect();
}

export function getWsProtection(client: Keycloak.Keycloak): WebsocketRequestHandler {
    return async (ws, request, next) => {
        let token = request.query.token as string;
        if (token && await validateToken(client, token)) {
            return next();
        }
        ws.close(1001, "Access denied");
    }
}

// private
// --------------------------------------------
async function validateToken(client: Keycloak.Keycloak, token: string): Promise<boolean> {
    let realmUrl = client.getConfig()["realmUrl"];
    let url = `${realmUrl}/protocol/openid-connect/userinfo`;
    let response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` }});
    return response.ok;
}
