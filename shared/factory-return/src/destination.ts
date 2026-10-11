import {
  DEFAULT_CONFIG, destinationReturnUrl, enrollDestination, getDestinationVisit,
  inheritDestinationRoute, safeSessionStorage,
  type BridgeConfig, type DestinationId, type StorageLike,
} from "./protocol.js";
import { listenForCooperativeEscape } from "./escape.js";

/** One instance per document. Initialize before analytics and the application router. */
export function createDestinationBridge({ window, document, config = DEFAULT_CONFIG,
  storage = safeSessionStorage(window), now = Date.now,
  isRouteAllowed = (pathname: string) => pathname === "/" }: {
  window: Window;
  document: Document;
  config?: BridgeConfig;
  storage?: StorageLike | null;
  now?: () => number;
  isRouteAllowed?: (pathname: string, destination: DestinationId) => boolean;
}) {
  const topLevel = window.top === window;
  enrollDestination({ href: window.location.href, referrer: document.referrer,
    history: window.history, storage, topLevel, config, now: now() });
  let disposed = false;
  const getVisit = () => disposed ? null : getDestinationVisit({ href: window.location.href,
    state: window.history.state, storage, topLevel, config, now: now(), isRouteAllowed });
  const returnNow = () => {
    const visit = getVisit();
    const target = visit && destinationReturnUrl(visit, config, now());
    if (!target) return false;
    window.location.assign(target);
    return true;
  };
  const stop = listenForCooperativeEscape({ window, document,
    getVisit: () => {
      const visit = getVisit();
      return visit ? `${visit.factoryId}:${visit.nonce}:${window.location.href}` : null;
    }, onReturn: returnNow });
  return {
    getVisit,
    /** Call before PUSH/REPLACE; direct visits and history traversal never inherit. */
    inheritRoute: (nextState: unknown, nextHref: string, action = "PUSH") =>
      inheritDestinationRoute({ visit: getVisit(), nextState, nextHref, action,
        isRouteAllowed, config, now: now() }),
    refresh: getVisit,
    returnNow,
    dispose: () => { disposed = true; stop(); },
  };
}
