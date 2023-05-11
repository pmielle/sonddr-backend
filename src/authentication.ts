import  Keycloak, { KeycloakConfig } from "keycloak-connect";
import dotenv from "dotenv";
import { MemoryStore } from "express-session";

dotenv.config({path: ".env.dev"});

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
    return new Keycloak({store: store}, config);
}

export function getAuthMiddleware(client: Keycloak.Keycloak) {
    return client.middleware();
}

export function getAuthProtection(client: Keycloak.Keycloak) {
    return client.protect();
}
