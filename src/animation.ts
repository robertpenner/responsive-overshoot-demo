import { cruiseInOutBackEasing } from './utils/cruise-easing';

interface AnimationParams {
  element: HTMLElement;
  distance: number;
  direction: 'forward' | 'back';
  cruiseSpeed: number;
  overshoot: number;
}

export async function animateBall({
  element,
  distance,
  direction,
  cruiseSpeed,
  overshoot,
}: AnimationParams): Promise<void> {
  const { easing, duration } = cruiseInOutBackEasing({
    cruiseSpeed,
    distance,
    overshoot,
  });

  // compute rotation from circumference
  const radius = element.clientWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const totalRotation = (distance / circumference) * 360;

  const fromX = direction === 'forward' ? 0 : distance;
  const toX = direction === 'forward' ? distance : 0;
  const fromAngle = direction === 'forward' ? 0 : totalRotation;
  const toAngle = direction === 'forward' ? totalRotation : 0;

  await element.animate(
    [
      { transform: `translateX(${fromX}px) rotate(${fromAngle}deg)` },
      { transform: `translateX(${toX}px) rotate(${toAngle}deg)` },
    ],
    {
      duration: duration * 1000,
      easing,
      fill: 'forwards',
    }
  ).finished;
}
