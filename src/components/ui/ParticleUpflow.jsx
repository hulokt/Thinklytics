import React, { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 60;
const COLORS = [
  'rgba(40,160,255,0.18)',
  'rgba(40,160,255,0.12)',
  'rgba(255,255,255,0.10)',
  'rgba(80,180,255,0.10)'
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function ParticleUpflow({ width = 320, height = 320 }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = true;

    function resetParticle(p) {
      p.x = randomBetween(0, width);
      p.y = height + randomBetween(0, 40);
      p.radius = randomBetween(1, 2.5);
      p.speed = randomBetween(0.3, 1.1);
      p.alpha = randomBetween(0.18, 0.32);
      p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.life = randomBetween(2, 4);
      p.age = 0;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = {};
        resetParticle(p);
        p.x = randomBetween(0, width);
        p.y = randomBetween(0, height);
        particles.push(p);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (1 - p.age / p.life);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    function update(dt) {
      for (let p of particles) {
        p.y -= p.speed * dt * 0.06;
        p.age += dt * 0.001;
        if (p.y < -10 || p.age > p.life) {
          resetParticle(p);
        }
      }
    }

    let last = performance.now();
    function loop(now) {
      if (!running) return;
      const dt = now - last;
      last = now;
      update(dt);
      draw();
      requestAnimationFrame(loop);
    }

    createParticles();
    loop(last);
    return () => { running = false; };
  }, [width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none', borderRadius: '9999px', background: 'transparent' }}
      aria-hidden="true"
    />
  );
} 