import React, { useRef, useEffect } from 'react';
import { animateBall } from './animation';
import './style.css';

const cruiseSpeed = 300;
const overshoot = 50;
const distances = [100, 300, 500];

export const BallsAnimation: React.FC = () => {
  const ballRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    let isMounted = true;
    (async function loop() {
      while (isMounted) {
        // roll forward 1,2,3
        for (let i = 0; i < ballRefs.length; i++) {
          if (ballRefs[i].current) {
            await animateBall({
              element: ballRefs[i].current,
              distance: distances[i],
              direction: 'forward',
              cruiseSpeed,
              overshoot,
            });
          }
        }
        // roll back 1,2,3
        for (let i = 0; i < ballRefs.length; i++) {
          if (ballRefs[i].current) {
            await animateBall({
              element: ballRefs[i].current,
              distance: distances[i],
              direction: 'back',
              cruiseSpeed,
              overshoot,
            });
          }
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="balls-container">
      <div id="ball1" ref={ballRefs[0]} className="ball" />
      <div id="ball2" ref={ballRefs[1]} className="ball" />
      <div id="ball3" ref={ballRefs[2]} className="ball" />
    </div>
  );
};
