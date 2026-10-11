import type { BridgeConfig } from "./protocol.js";

/** Exact verified deployments. Never derive an allowlist from a URL parameter or referrer. */
export const FACTORY_RETURN_CONFIG: BridgeConfig = Object.freeze({
  factories: Object.freeze({
    production: "https://psstmatt.com",
    review: "https://matt-konami-computers.psstmatt.chatgpt.site",
  }),
});
