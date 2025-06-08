import { type EasingParams, type EasingResult } from '../types';
import { reverseEasing, mirrorEasing, easingToCssLinear } from './easing-utils';

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
