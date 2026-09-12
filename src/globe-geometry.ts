/** COBE's origin is 90 degrees west of the conventional geographic origin. */
export function focusLocation(latitude: number, longitude: number) {
  return { phi: Math.PI * 1.5 - longitude * Math.PI / 180, theta: latitude * Math.PI / 180 };
}
