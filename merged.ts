export type EasingParams = {
  cruiseSpeed: number;
  distance: number;
  overshoot: number;
};

export type EasingResult = {
  positionFn?: (t: number) => number;
  easingFn: (u: number) => number;
  easing: string;
  duration: number;
};

export function reverseEasing(
  fn: (t: number) => number
): (t: number) => number {
  return (t: number) => 1 - fn(1 - t);
}

export function mirrorEasing(fn: (t: number) => number): (t: number) => number {
  return (t: number) => {
    if (t <= 0.5) return 0.5 * fn(2 * t);
    return 0.5 + 0.5 * (1 - fn(2 * (1 - t)));
  };
}

/**
 * Remove any middle point that lies (within ε) on the straight line
 * between its two neighbors.
 */
function pruneColinearPoints(
  pts: { x: number; y: number }[],
  ε = 1e-6
): { x: number; y: number }[] {
  if (pts.length < 3) return pts.slice();
  const out: { x: number; y: number }[] = [pts[0], pts[1]];

  for (let i = 2; i < pts.length; i++) {
    const p0 = out[out.length - 2];
    const p1 = out[out.length - 1];
    const p2 = pts[i];

    // Compute twice the signed area of triangle p0,p1,p2
    const area2 = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);

    if (Math.abs(area2) < ε) {
      // p1 is colinear → drop it
      out.pop();
    }
    out.push(p2);
  }

  return out;
}

/**
 * Sample an easing(t) → v curve, prune straight segments,
 * and emit a CSS `linear()` timing-function string using
 * 4-digit precision for both output and input percentages.
 */
export function easingToCssLinear(
  easeFn: (t: number) => number,
  sampleCount = 50,
  epsilon = 1e-6
): string {
  // 1) Uniformly sample
  const samples: { x: number; y: number }[] = [];
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    samples.push({ x: t, y: easeFn(t) });
  }

  // 2) Prune colinear points (same helper as before)
  const pruned = pruneColinearPoints(samples, epsilon);

  // 3) Emit in the form "output [input%]" with 4-digit precision
  const lastIdx = pruned.length - 1;
  const parts = pruned.map((p, idx) => {
    // output value with 4 significant digits
    const out = p.y.toPrecision(4);
    // input percentage also with 4 significant digits, for non-first/non-last
    if (idx > 0 && idx < lastIdx) {
      const pct = (p.x * 100).toPrecision(4) + '%';
      return `${out} ${pct}`;
    }
    return out;
  });

  return `linear(${parts.join(', ')})`;
}

export function cruiseOutBackEasing({
  cruiseSpeed,
  distance,
  overshoot,
}: EasingParams): EasingResult {
  const V = cruiseSpeed;
  const D = distance;
  const dist = overshoot;

  // Key times
  const x0 = D / V;
  const H = (2 * dist) / V; // quad vertex offset
  const L = (3 * dist) / V; // cubic duration
  const x1 = x0 + H;
  const x2 = x1 + L;
  const y1 = D + dist;

  // Quadratic segment params
  const a = -V / (2 * H);
  const b = V;

  // Cubic segment params
  const c3 = (2 * dist) / (L * L * L);
  const c2 = -1.5 * c3 * L;

  function positionFn(t: number): number {
    if (t <= x0) return V * t;
    if (t <= x1) {
      const u = t - x0;
      return a * u * u + b * u + D;
    }
    if (t <= x2) {
      const u = t - x1;
      return c3 * u * u * u + c2 * u * u + y1;
    }
    return D;
  }

  const duration = x2;

  function easingFn(uNorm: number): number {
    const t = uNorm * duration;
    return positionFn(t) / D;
  }

  const easing = easingToCssLinear(easingFn, 50);

  return { positionFn, easingFn, easing, duration };
}

export function cruiseInBackEasing(params: EasingParams): EasingResult {
  const { easingFn: outFn, duration } = cruiseOutBackEasing(params);
  const inFn = reverseEasing(outFn);
  const easing = easingToCssLinear(inFn, 50);
  return { easingFn: inFn, easing, duration };
}

export function cruiseInOutBackEasing(params: EasingParams): EasingResult {
  const { easingFn: inFn, duration } = cruiseInBackEasing({
    ...params,
    overshoot: params.overshoot * 2,
  });
  const inOutFn = mirrorEasing(inFn);
  const easing = easingToCssLinear(inOutFn, 50);
  return { easingFn: inOutFn, easing, duration };
}
