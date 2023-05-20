import Keycloak, { KeycloakConfig } from "keycloak-connect";
import dotenv from "dotenv";
import { MemoryStore } from "express-session";
import { RequestHandler } from "express";
import { WebsocketRequestHandler } from "express-ws";

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

export function getAuthClient(store: MemoryStore): Keycloak.Keycloak {
    return new Keycloak({ store: store }, config);
}

export function getAuthMiddleware(client: Keycloak.Keycloak): RequestHandler[] {
    return client.middleware();
}

export function getAuthProtection(client: Keycloak.Keycloak): RequestHandler {
    return client.protect();
}

export function protectWs(ws, request, next): WebsocketRequestHandler {
    if (request.kauth && request.kauth.grant) {
        return next();
    }
    ws.close(1001, "Access denied");
};

