"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe, { type Globe as GlobeInstance, type COBEOptions } from "cobe";
import { createCanvasGlobe } from "./globe-fallback";
import { focusLocation } from "./globe-geometry";

const seattle: Point = [47.61, -122.33];
type Point = [number, number];

export type GlobePreset = {
  id: string; label: string; title: string; description: string; places: string[];
  longitude: number; markers: Array<{ location: Point; size: number; color: string; label?: string }>; arcs: Array<{ from: Point; to: Point }>;
};
export type CompanyFootprint = GlobePreset & { hq: string; offices: string[]; regions: string[] };

function routes(destinations: Point[]) { return destinations.filter((p) => p[0] !== seattle[0] || p[1] !== seattle[1]).map((to) => ({ from: seattle, to })); }
function footprint(company: string, hq: string, hqPoint: Point, offices: Array<[string, Point]>, regions: string[]): CompanyFootprint {
  return {
    id: `company-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label: company, title: company, description: "Company footprint",
    places: [hq, ...offices.map(([city]) => city)], hq, offices: offices.map(([city]) => city), regions, longitude: hqPoint[1],
    markers: [{ location: seattle, size: 7, color: "#43dcff", label: "Seattle" }, { location: hqPoint, size: 10, color: "#ff4cbc", label: hq }, ...offices.map(([city, location]) => ({ location, size: 6, color: "#83ffb6", label: city }))],
    arcs: routes([hqPoint, ...offices.map(([, point]) => point)]),
  };
}

export const northAmerica: GlobePreset = {
  id: "north-america", label: "North America", title: "North America", description: "Current interview centers",
  places: ["Seattle", "Bay Area", "Columbus", "New York", "Boston"], longitude: -96,
  markers: [{ location: seattle, size: 9, color: "#43dcff", label: "Seattle" }, { location: [37.77, -122.42], size: 7, color: "#ff4cbc", label: "Bay Area" }, { location: [39.96, -83], size: 6, color: "#83ffb6", label: "Columbus" }, { location: [40.71, -74.01], size: 7, color: "#b56cff", label: "New York" }, { location: [42.36, -71.06], size: 6, color: "#ff9466", label: "Boston" }],
  arcs: routes([[37.77, -122.42], [39.96, -83], [40.71, -74.01], [42.36, -71.06]]),
};

const profiles: Record<string, CompanyFootprint> = {
  // HQ source: https://www.anduril.com/careers
  Anduril: footprint("Anduril", "Costa Mesa", [33.64, -117.92], [], []),
  Amazon: footprint("Amazon", "Seattle", [47.61, -122.33], [["Arlington", [38.88, -77.11]], ["New York", [40.71, -74.01]], ["London", [51.51, -0.13]]], ["North America", "Europe", "Asia Pacific"]),
  "Hinge Health": footprint("Hinge Health", "San Francisco", [37.77, -122.42], [["Portland", [45.52, -122.68]], ["Toronto", [43.65, -79.38]]], ["North America"]),
  Walmart: footprint("Walmart", "Bentonville", [36.37, -94.21], [["San Bruno", [37.63, -122.42]], ["Hoboken", [40.74, -74.03]], ["Bangalore", [12.97, 77.59]]], ["North America", "India", "Global retail"]),
  Disney: footprint("Disney", "Burbank", [34.18, -118.31], [["Glendale", [34.14, -118.26]], ["New York", [40.71, -74.01]], ["London", [51.51, -0.13]]], ["North America", "Europe", "Asia Pacific"]),
  Turo: footprint("Turo", "San Francisco", [37.77, -122.42], [["Phoenix", [33.45, -112.07]], ["Toronto", [43.65, -79.38]], ["London", [51.51, -0.13]]], ["North America", "Europe", "Australia"]),
  Dialpad: footprint("Dialpad", "San Francisco", [37.77, -122.42], [["Austin", [30.27, -97.74]], ["Vancouver", [49.28, -123.12]], ["Manila", [14.6, 120.98]]], ["North America", "Asia Pacific"]),
  OpenAI: footprint("OpenAI", "San Francisco", [37.77, -122.42], [["Seattle", [47.61, -122.33]], ["New York", [40.71, -74.01]], ["London", [51.51, -0.13]]], ["North America", "Europe", "Asia Pacific"]),
  "Applied Intuition": footprint("Applied Intuition", "Mountain View", [37.39, -122.08], [["Detroit", [42.33, -83.05]], ["Munich", [48.14, 11.58]], ["Tokyo", [35.68, 139.65]]], ["North America", "Europe", "Asia Pacific"]),
  "Eight Sleep": footprint("Eight Sleep", "New York", [40.71, -74.01], [["Miami", [25.76, -80.19]], ["London", [51.51, -0.13]]], ["North America", "Europe"]),
  "NetJets": footprint("NetJets", "Columbus", [39.96, -83], [["New York", [40.71, -74.01]], ["London", [51.51, -0.13]], ["Lisbon", [38.72, -9.14]]], ["North America", "Europe"]),
  "Boston Dynamics": footprint("Boston Dynamics", "Waltham", [42.38, -71.24], [["Pittsburgh", [40.44, -79.99]], ["Seoul", [37.57, 126.98]]], ["North America", "Asia Pacific"]),
  Affirm: footprint("Affirm", "San Francisco", [37.77, -122.42], [["New York", [40.71, -74.01]], ["Chicago", [41.88, -87.63]]], ["North America"]),
  Tesla: footprint("Tesla", "Austin", [30.27, -97.74], [["Palo Alto", [37.44, -122.14]], ["Fremont", [37.55, -121.99]], ["Berlin", [52.52, 13.41]], ["Shanghai", [31.23, 121.47]]], ["North America", "Europe", "Asia Pacific"]),
  Stripe: footprint("Stripe", "South San Francisco", [37.65, -122.41], [["Seattle", [47.61, -122.33]], ["New York", [40.71, -74.01]], ["Dublin", [53.35, -6.26]]], ["North America", "Europe", "Asia Pacific"]),
  Salesforce: footprint("Salesforce", "San Francisco", [37.77, -122.42], [["Indianapolis", [39.77, -86.16]], ["London", [51.51, -0.13]], ["Singapore", [1.35, 103.82]]], ["North America", "Europe", "Asia Pacific"]),
  Plaid: footprint("Plaid", "San Francisco", [37.77, -122.42], [["New York", [40.71, -74.01]], ["Salt Lake City", [40.76, -111.89]]], ["North America", "Europe"]),
  SoFi: footprint("SoFi", "San Francisco", [37.77, -122.42], [["New York", [40.71, -74.01]], ["Salt Lake City", [40.76, -111.89]]], ["North America"]),
  LinkedIn: footprint("LinkedIn", "Sunnyvale", [37.37, -122.04], [["New York", [40.71, -74.01]], ["Toronto", [43.65, -79.38]], ["Dublin", [53.35, -6.26]]], ["North America", "Europe", "Asia Pacific"]),
  "City of Bellevue": footprint("City of Bellevue", "Bellevue", [47.61, -122.2], [["Seattle", [47.61, -122.33]]], ["Pacific Northwest"]),
  "Grove Collaborative": footprint("Grove Collaborative", "San Francisco", [37.77, -122.42], [["Minneapolis", [44.98, -93.27]], ["New York", [40.71, -74.01]]], ["North America"]),
};
export function companyFootprint(company: string) { return profiles[company]; }

export function focusAngles(preset: GlobePreset) {
  const latitude = preset.id === "north-america" ? 35 : preset.markers[1]?.location[0] ?? 30;
  return focusLocation(latitude, preset.longitude);
}
function markers(preset: GlobePreset) {
  return preset.markers.map((marker, index) => ({
    id: `location-${index}`, location: marker.location, size: index === 1 ? .065 : .035,
    color: (index === 1 ? [1, .55, .76] : [.78, .79, .75]) as [number, number, number],
  }));
}

export function Globe({ preset }: { preset: GlobePreset }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const instance = useRef<GlobeInstance | null>(null);
  const target = useRef(focusAngles(preset));
  const current = useRef(focusAngles(preset));
  const drag = useRef<{ x: number; y: number } | null>(null);
  const latestPreset = useRef(preset);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    latestPreset.current = preset;
    target.current = focusAngles(preset);
    drag.current = null;
    instance.current?.update({ markers: markers(preset), arcs: preset.arcs });
  }, [preset]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0;
    let globe: GlobeInstance;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.max(element.clientWidth, 200);
    const lost = (event: Event) => { event.preventDefault(); setUnavailable(true); cancelAnimationFrame(frame); };
    element.addEventListener("webglcontextlost", lost);
    try {
      const options: COBEOptions = {
        devicePixelRatio: dpr, width: size, height: size,
        ...current.current, dark: 1, diffuse: 1.6, mapSamples: 24000,
        mapBrightness: 5.5, mapBaseBrightness: 0, baseColor: [.32, .32, .30],
        markerColor: [1, .55, .76], glowColor: [.13, .13, .12],
        markers: markers(latestPreset.current), arcs: latestPreset.current.arcs,
        arcColor: [.76, .72, .67], arcWidth: .4, arcHeight: .18,
        opacity: 1, scale: .94,
      };
      const supportsWebGL = element.getContext("webgl2", { alpha: true, antialias: true }) || element.getContext("webgl", { alpha: true, antialias: true });
      globe = supportsWebGL ? createGlobe(element, options) : createCanvasGlobe(element, options);
      instance.current = globe;
    } catch {
      queueMicrotask(() => setUnavailable(true));
      element.removeEventListener("webglcontextlost", lost);
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) globe.update({ width, height: width });
    });
    observer.observe(element);
    let settledFrames = 0;
    const animate = () => {
      const delta = Math.atan2(Math.sin(target.current.phi - current.current.phi), Math.cos(target.current.phi - current.current.phi));
      const speed = reducedMotion.matches ? 1 : .1;
      current.current.phi += delta * speed;
      current.current.theta += (target.current.theta - current.current.theta) * speed;
      const moving = Math.abs(delta) > .0001 || Math.abs(target.current.theta - current.current.theta) > .0001;
      settledFrames = moving ? 0 : settledFrames + 1;
      // Keep initial frames for COBE's map texture load; avoid repainting a resting globe.
      if (moving || settledFrames < 120) globe.update(current.current);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); globe.destroy(); instance.current = null;
      element.removeEventListener("webglcontextlost", lost);
    };
  }, []);

  return <div className="globe-frame" data-location={preset.id}>
    <canvas ref={canvas} className="globe-canvas" role="img" aria-label={`${preset.title} globe. Drag or use arrow keys to rotate.`}
      tabIndex={0} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") target.current = focusAngles(preset);
        if (event.key === "ArrowLeft") target.current.phi -= .2;
        if (event.key === "ArrowRight") target.current.phi += .2;
        if (event.key === "ArrowUp") target.current.theta = Math.min(1.4, target.current.theta + .15);
        if (event.key === "ArrowDown") target.current.theta = Math.max(-1.4, target.current.theta - .15);
      }} onPointerDown={(event) => {
        drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={(event) => {
        if (!drag.current) return;
        target.current.phi += (event.clientX - drag.current.x) * .008;
        target.current.theta = Math.max(-1.4, Math.min(1.4, target.current.theta + (event.clientY - drag.current.y) * .006));
        drag.current = { x: event.clientX, y: event.clientY };
      }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} />
    {unavailable && <p className="globe-fallback">Globe unavailable on this device. Location details are below.</p>}
    <div className="globe-tools"><span>Drag to explore</span><button type="button" onClick={() => { target.current = focusAngles(preset); }} aria-label="Recenter globe">Recenter ↗</button></div>
  </div>;
}
