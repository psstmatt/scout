import { createDestinationBridge } from "./destination.js";
import { FACTORY_RETURN_CONFIG } from "./config.js";
import { installFactoryHashLinks } from "./hash-links.js";

/** Load before app/analytics scripts. It never hides content or adds UI. Root routes only. */
export const factoryReturnBridge = typeof window === "undefined" ? null :
  createDestinationBridge({ window, document, config: FACTORY_RETURN_CONFIG });

export const stopFactoryHashLinks = factoryReturnBridge &&
  window.location.origin === "https://anduril.psstmatt.com" ?
  installFactoryHashLinks({ window, document, bridge: factoryReturnBridge }) : null;

if (factoryReturnBridge) document.documentElement.setAttribute("data-factory-return", "ready");
