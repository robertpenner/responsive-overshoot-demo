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
