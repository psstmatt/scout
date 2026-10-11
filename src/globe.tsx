"use client";

import { Button } from "./ui/button";

import { useEffect, useRef, useState } from "react";
import createGlobe, { type Globe as GlobeInstance, type COBEOptions } from "cobe";
import { createCanvasGlobe } from "./globe-fallback";
import { focusLocation } from "./globe-geometry";
import type { GlobePreset } from "./geography-data";
export type { GlobePreset } from "./geography-data";

export function focusAngles(preset: GlobePreset) {
  return focusLocation(preset.latitude, preset.longitude);
}
function markers(preset: GlobePreset) {
  return preset.markers.map((marker) => ({
    id: marker.id.replace(/[^a-zA-Z0-9_-]/g, "-"), location: marker.location, size: marker.size,
    color: [1, 3, 5].map((offset) => parseInt(marker.color.slice(offset, offset + 2), 16) / 255) as [number, number, number],
  }));
}

/** COBE v2 inserts a wrapper around the canvas and leaves it behind on destroy. */
export function restoreCanvasHost(element: HTMLCanvasElement, host: HTMLDivElement) {
  // This host owns only this canvas. Restore the DOM React created, including when
  // an initialization error happened after COBE reparented the element.
  host.replaceChildren(element);
}

export function Globe({ preset }: { preset: GlobePreset }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const instance = useRef<GlobeInstance | null>(null);
  const target = useRef(focusAngles(preset));
  const current = useRef(focusAngles(preset));
  const drag = useRef<{ x: number; y: number } | null>(null);
  const latestPreset = useRef(preset);
  const wake = useRef<() => void>(() => {});
  const [renderer, setRenderer] = useState<"auto" | "canvas">("auto");
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    latestPreset.current = preset;
    target.current = focusAngles(preset);
    drag.current = null;
    instance.current?.update({ markers: markers(preset), arcs: preset.arcs });
    wake.current();
  }, [preset]);

  useEffect(() => {
    const element = canvas.current;
    const host = canvasHost.current;
    if (!element || !host) return;
    let frame = 0;
    let disposed = false;
    let globe: GlobeInstance;
    let settledFrames = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.max(element.clientWidth, 200);
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      // Key the React-owned host, not COBE's reparented canvas. React can safely
      // remove the whole host while the 2D fallback receives a fresh canvas.
      setRenderer("canvas");
    };
    element.addEventListener("webglcontextlost", lost);
    try {
      const options: COBEOptions = {
        devicePixelRatio: dpr, width: size, height: size,
        ...current.current, dark: 1, diffuse: 1.6, mapSamples: 24000,
        mapBrightness: 5.5, mapBaseBrightness: 0, baseColor: [.32, .32, .30],
        markerColor: [1, .55, .76], glowColor: [.13, .13, .12],
        markers: markers(latestPreset.current), arcs: latestPreset.current.arcs,
        opacity: 1, scale: .94,
      };
      const supportsWebGL = renderer !== "canvas" && (element.getContext("webgl2", { alpha: true, antialias: true }) || element.getContext("webgl", { alpha: true, antialias: true }));
      globe = supportsWebGL ? createGlobe(element, options) : createCanvasGlobe(element, options);
      instance.current = globe;
    } catch {
      restoreCanvasHost(element, host);
      queueMicrotask(() => {
        if (disposed) return;
        if (renderer === "auto") setRenderer("canvas");
        else setUnavailable(true);
      });
      element.removeEventListener("webglcontextlost", lost);
      return () => { disposed = true; restoreCanvasHost(element, host); };
    }
    const animate = () => {
      frame = 0;
      const delta = Math.atan2(Math.sin(target.current.phi - current.current.phi), Math.cos(target.current.phi - current.current.phi));
      const speed = reducedMotion.matches ? 1 : .1;
      current.current.phi += delta * speed;
      current.current.theta += (target.current.theta - current.current.theta) * speed;
      const moving = Math.abs(delta) > .0001 || Math.abs(target.current.theta - current.current.theta) > .0001;
      settledFrames = moving ? 0 : settledFrames + 1;
      globe.update(current.current);
      // Keep initial frames for COBE's async map texture, then actually stop the
      // frame loop. A filter, location, resize, or keyboard/pointer action wakes it.
      if (moving || settledFrames < 120) frame = requestAnimationFrame(animate);
    };
    const restart = () => {
      settledFrames = 0;
      if (!disposed && !frame) frame = requestAnimationFrame(animate);
    };
    wake.current = restart;
    reducedMotion.addEventListener("change", restart);
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) { globe.update({ width, height: width }); restart(); }
    });
    observer.observe(element);
    restart();
    return () => {
      disposed = true;
      wake.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener("change", restart);
      element.removeEventListener("webglcontextlost", lost);
      try { globe.destroy(); }
      finally {
        instance.current = null;
        restoreCanvasHost(element, host);
      }
    };
  }, [renderer]);

  return <div className="globe-frame" data-location={preset.id}>
    <div key={renderer} ref={canvasHost} className="globe-canvas-host">
    <canvas ref={canvas} className="globe-canvas" role="img" aria-label={`${preset.title}. ${preset.description} Drag or use arrow keys to rotate; Home recenters. Use the location buttons below to explore conversations.`}
      tabIndex={0} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") target.current = focusAngles(preset);
        if (event.key === "ArrowLeft") target.current.phi -= .2;
        if (event.key === "ArrowRight") target.current.phi += .2;
        if (event.key === "ArrowUp") target.current.theta = Math.min(1.4, target.current.theta + .15);
        if (event.key === "ArrowDown") target.current.theta = Math.max(-1.4, target.current.theta - .15);
        wake.current();
      }} onPointerDown={(event) => {
        if (event.button !== 0) return;
        drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={(event) => {
        if (!drag.current) return;
        target.current.phi += (event.clientX - drag.current.x) * .008;
        target.current.theta = Math.max(-1.4, Math.min(1.4, target.current.theta + (event.clientY - drag.current.y) * .006));
        drag.current = { x: event.clientX, y: event.clientY };
        wake.current();
      }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} />
    </div>
    {unavailable && <p className="globe-fallback">Globe unavailable on this device. All location details and controls are below.</p>}
    <div className="globe-tools"><span>Drag or use arrow keys</span><Button variant="scout" size="scout" type="button" onClick={() => { target.current = focusAngles(preset); wake.current(); }} aria-label="Recenter globe">Recenter ↗</Button></div>
  </div>;
}
