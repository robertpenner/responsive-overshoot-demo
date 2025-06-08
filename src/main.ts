import { animateBall } from './animation';
import './style.css';

window.addEventListener('load', () => {
  const cruiseSpeed = 300;
  const overshoot = 50;
  const distances = [100, 300, 500];

  const balls = [
    document.getElementById('ball1'),
    document.getElementById('ball2'),
    document.getElementById('ball3'),
  ] as HTMLElement[];

  (async function loop() {
    while (true) {
      // roll forward 1,2,3
      for (let i = 0; i < balls.length; i++) {
        await animateBall({
          element: balls[i],
          distance: distances[i],
          direction: 'forward',
          cruiseSpeed,
          overshoot,
        });
      }
      // roll back 1,2,3
      for (let i = 0; i < balls.length; i++) {
        await animateBall({
          element: balls[i],
          distance: distances[i],
          direction: 'back',
          cruiseSpeed,
          overshoot,
        });
      }
    }
  })();
});
