import { stripFactoryMarkers, type Visit } from "./protocol.js";

/**
 * Explicit Anduril anchor-click integration. Its existing hashchange handler owns
 * section rendering, scrolling and focus. Never infer provenance on popstate.
 */
export function installFactoryHashLinks({ window, document, bridge }: {
  window: Window;
  document: Document;
  bridge: {
    getVisit: () => Visit | null;
    inheritRoute: (nextState: unknown, nextHref: string, action?: string) => unknown;
  };
}) {
  const click = (event: MouseEvent) => {
    if (!event.isTrusted || event.defaultPrevented || event.button !== 0 || event.metaKey ||
      event.ctrlKey || event.altKey || event.shiftKey || !bridge.getVisit()) return;
    const anchor = event.composedPath().find(node => !!node && typeof node === "object" &&
      (node as Element).nodeType === 1 && (node as Element).tagName === "A") as HTMLAnchorElement | undefined;
    if (!anchor || !anchor.hasAttribute("href") || anchor.hasAttribute("download")) return;
    const contextTarget = anchor.getAttribute("target") ??
      document.querySelector("base[target]")?.getAttribute("target") ?? "";
    if (contextTarget && contextTarget.toLowerCase() !== "_self") return;
    try {
      const from = new URL(window.location.href);
      const target = new URL(anchor.href, from);
      if (target.origin !== from.origin || target.pathname !== from.pathname || target.search !== from.search ||
        !target.hash || target.hash === from.hash || target.username || target.password ||
        stripFactoryMarkers(target.href).markers.length) return;
      const state = bridge.inheritRoute(window.history.state, target.href, "PUSH");
      // All checks are synchronous and operate on the still-current accepted entry.
      if (!bridge.getVisit()) return;
      window.history.pushState(state, "", target.href);
      event.preventDefault();
      window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: from.href, newURL: target.href }));
    } catch { /* Leave the native anchor action available if pushState failed. */ }
  };
  window.addEventListener("click", click as EventListener);
  return () => window.removeEventListener("click", click as EventListener);
}
