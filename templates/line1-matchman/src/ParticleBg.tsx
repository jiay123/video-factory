import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

function seedRand(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type BgKind = "money" | "free" | "cta" | "whisper" | "bill" | "edit" | "voice" | "colibri" | "docs" | "tech";

export const ParticleBg: React.FC<{ mood: BgKind; seedBase: number }> = ({ mood, seedBase }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
    const t = frame / fps;
    const rnd = seedRand(seedBase);

    const pal: Record<BgKind, { primary: string; secondary: string; glow: string }[]> = {
      money: [
        { primary: "183,139,255", secondary: "200,80,255", glow: "140,60,255" },
        { primary: "170,120,255", secondary: "255,100,200", glow: "120,40,200" },
      ],
      bill: [
        { primary: "183,139,255", secondary: "160,100,255", glow: "140,60,255" },
        { primary: "200,80,255", secondary: "180,60,255", glow: "160,40,255" },
      ],
      whisper: [
        { primary: "0,255,180", secondary: "80,220,255", glow: "0,200,220" },
        { primary: "0,220,255", secondary: "100,180,255", glow: "0,180,255" },
      ],
      voice: [
        { primary: "0,255,150", secondary: "100,200,255", glow: "0,200,220" },
        { primary: "0,255,180", secondary: "80,220,255", glow: "0,180,255" },
      ],
      edit: [
        { primary: "183,139,255", secondary: "255,138,209", glow: "140,60,255" },
        { primary: "160,100,255", secondary: "180,60,255", glow: "120,40,255" },
      ],
      free: [
        { primary: "0,255,160", secondary: "0,220,255", glow: "0,200,220" },
        { primary: "0,255,180", secondary: "0,200,255", glow: "0,180,255" },
      ],
      cta: [
        { primary: "255,210,74", secondary: "255,240,100", glow: "255,180,30" },
        { primary: "255,230,80", secondary: "255,255,140", glow: "255,200,50" },
      ],
      colibri: [
        { primary: "61,220,255", secondary: "0,255,176", glow: "0,180,255" },
        { primary: "0,255,176", secondary: "183,139,255", glow: "0,220,220" },
      ],
      docs: [
        { primary: "120,200,255", secondary: "0,255,180", glow: "80,160,255" },
        { primary: "0,255,180", secondary: "120,160,255", glow: "0,220,200" },
      ],
      tech: [
        { primary: "255,210,74", secondary: "0,255,176", glow: "255,180,30" },
        { primary: "0,255,176", secondary: "255,210,74", glow: "0,220,220" },
      ],
    };
    const cm = pal[mood];
    const c0 = cm[0];
    const c1 = cm[1];

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, `rgba(${c0.primary},0.09)`);
    bgGrad.addColorStop(0.5, `rgba(${c1.secondary},0.045)`);
    bgGrad.addColorStop(1, `rgba(${c0.glow},0.07)`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);



    // Large glowing orbs
    ctx.save();
    for (let o = 0; o < 6; o++) {
      const seed = rnd();
      const ox = (seed * width + t * (20 + seed * 30)) % width;
      const oy = height * 0.2 + seed * height * 0.6 + Math.sin(t * 0.5 + seed * 7) * 80;
      const radius = 80 + seed * 200;
      const oc = cm[o % cm.length];
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      g.addColorStop(0, `rgba(${oc.glow},0.05)`);
      g.addColorStop(0.5, `rgba(${oc.primary},0.025)`);
      g.addColorStop(1, `rgba(${oc.secondary},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Primary particles - bigger, brighter
    const N = 110;
    for (let i = 0; i < N; i++) {
      const seed = rnd();
      const iPhase = i * 0.17;
      const x = (iPhase * 1397 + t * (18 + seed * 12)) % width;
      const yBase = height * (0.05 + seed * 0.9) + Math.sin(t * 0.9 + iPhase * 7) * 80;
      const y = ((yBase % height) + height) % height;
      const c = cm[i % cm.length];
      const rad = 4 + seed * 10;

      const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 4);
      g.addColorStop(0, `rgba(${c.glow},0.11)`);
      g.addColorStop(0.5, `rgba(${c.primary},0.04)`);
      g.addColorStop(1, `rgba(${c.secondary},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${c.primary},0.26)`;
      ctx.beginPath();
      ctx.arc(x, y, rad * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${c.glow},0.38)`;
      ctx.beginPath();
      ctx.arc(x, y, rad * 0.6, 0, Math.PI * 2);
      ctx.fill();

    }

    /* 🚫 漂浮大字已全部取消（老贾 10/1 拍板："画布上有好多那种字体，把那个字体取消"）
       背景只留粒子 + 连线，画面上的每一个字都必须是从老贾嘴里吐出来的，
       背景再飘字会跟正文抢眼，观众读不清。 */

    // Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.8);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }, [frame, mood, seedBase, width, height, fps]);

  return (
    <canvas ref={ref} width={width} height={height} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
  );
};
