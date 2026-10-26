import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
} from "remotion";

const GOLD = "#FFD24A";
const BLUE = "#4A8CFF";
const WHITE = "#F2F5FA";
const DIM = "#7A879E";
const BG = "#04060C";

const SHOT = 108;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const Starfield: React.FC = () => {
  const f = useCurrentFrame();
  const dots = React.useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: (i * 173.3) % 1080,
        y: (i * 241.7) % 1920,
        r: 1 + (i % 3),
        p: (i % 9) / 9,
      })),
    []
  );
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 55% at 50% 42%, #0C1428 0%, #060A14 45%, ${BG} 75%)`,
      }}
    >
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: "50%",
            background: i % 6 === 0 ? GOLD : "#8FA3C8",
            opacity: 0.12 + 0.4 * Math.abs(Math.sin(f / 55 + d.p * 6)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; hi: string; local: number }> = ({
  text,
  hi,
  local,
}) => {
  const t = clamp((local - 14) / 18);
  const parts = text.split(hi);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 620,
          background:
            "linear-gradient(180deg, rgba(4,6,12,0) 0%, rgba(4,6,12,0.82) 55%, rgba(4,6,12,0.96) 100%)",
          opacity: t,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 250,
          textAlign: "center",
        fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
        fontSize: 50,
        fontWeight: 900,
        letterSpacing: 1,
        lineHeight: 1.4,
        color: WHITE,
        opacity: t,
        transform: `translateY(${(1 - easeOut(t)) * 24}px)`,
        textShadow: "0 4px 26px rgba(0,0,0,0.95)",
      }}
    >
      {parts[0]}
      <span
        style={{
          color: GOLD,
          borderBottom: `6px solid ${GOLD}`,
          paddingBottom: 3,
        }}
      >
        {hi}
      </span>
      {parts[1] || ""}
      </div>
    </>
  );
};

const BigNum: React.FC<{
  value: number;
  local: number;
  dur: number;
  size: number;
  color?: string;
}> = ({ value, local, dur, size, color = GOLD }) => {
  const t = clamp(local / (dur * 0.55));
  const v = Math.floor(easeOut(t) * value);
  const land = clamp((local - dur * 0.55) / 16);
  const punch = 1 + 0.06 * Math.sin(clamp(land) * Math.PI);
  return (
    <div
      style={{
        fontFamily: '"Consolas", "Microsoft YaHei", monospace',
        fontSize: size,
        fontWeight: 900,
        color,
        letterSpacing: 1,
        transform: `scale(${punch})`,
        textShadow: `0 0 40px ${color}55`,
        whiteSpace: "nowrap",
      }}
    >
      {v.toLocaleString("en-US")}
    </div>
  );
};

/* ---------- 镜 1：手机存 1000 张就满 ---------- */
const S1: React.FC<{ local: number }> = ({ local }) => {
  const rise = easeOut(clamp(local / 22));
  const lit = Math.floor(clamp((local - 20) / 56) * 100);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 430,
          width: 420,
          height: 700,
          borderRadius: 54,
          border: `7px solid ${WHITE}`,
          background: "#0A1222",
          transform: `translateY(${(1 - rise) * 160}px)`,
          boxShadow: `0 0 70px ${BLUE}33`,
          padding: 22,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 7,
            height: "100%",
          }}
        >
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={i}
              style={{
                borderRadius: 5,
                background: i < lit ? (i % 7 === 0 ? GOLD : BLUE) : "#121A2C",
                opacity: i < lit ? 0.65 + 0.35 * ((i * 37) % 10) / 10 : 1,
                transition: "none",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center" }}>
        <BigNum value={1000} local={local} dur={92} size={150} />
        <div style={{ fontSize: 40, color: DIM, fontWeight: 700, marginTop: 6, fontFamily: '"Microsoft YaHei",sans-serif' }}>
          张照片
        </div>
      </div>
      <Caption text="手机存 1000 张照片，就满了" hi="1000 张" local={local} />
    </>
  );
};

/* ---------- 镜 2：1750 亿个旋钮 ---------- */
const S2: React.FC<{ local: number }> = ({ local }) => {
  const shake = local > 55 ? Math.sin(local * 2.2) * 3 : 0;
  const glow = easeOut(clamp(local / 20));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 560,
          width: 900,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255,210,74,0.18) 0%, rgba(255,210,74,0.05) 45%, rgba(0,0,0,0) 70%)",
          opacity: glow,
          filter: "blur(6px)",
        }}
      />
      {KNOBS.slice(0, 120).map((k, i) => {
        const t = easeOut(clamp((local - (i % 12) * 3) / 22));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40 + ((k.x * 1.18) % 990),
              top: 500 + (k.y * 0.9) % 700,
              width: k.sz * 0.8,
              height: k.sz * 0.8,
              borderRadius: "50%",
              background: i % 6 === 0 ? BLUE : GOLD,
              opacity: t * 0.18,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 700,
          display: "flex",
          justifyContent: "center",
          transform: `translateX(${shake}px)`,
        }}
      >
        <BigNum value={175000000000} local={local} dur={96} size={104} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 880,
          textAlign: "center",
          fontSize: 46,
          color: DIM,
          fontWeight: 700,
          fontFamily: '"Microsoft YaHei",sans-serif',
        }}
      >
        个旋钮
      </div>
      <Caption text="可 GPT-3 身上有 1750 亿个旋钮" hi="1750 亿" local={local} />
    </>
  );
};

/* ---------- 镜 3：只占 350G ---------- */
const KNOBS = (() => {
  let s = 20261023;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  return Array.from({ length: 190 }, () => ({
    x: 40 + rnd() * 720,
    y: 40 + rnd() * 600,
    d: 4 + Math.floor(rnd() * 34),
    sz: 9 + rnd() * 9,
  }));
})();

const S3: React.FC<{ local: number }> = ({ local }) => {
  const boxIn = easeOut(clamp(local / 16));
  const g = easeOut(clamp((local - 34) / 24));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 250,
          textAlign: "center",
          fontSize: 54,
          color: WHITE,
          fontWeight: 800,
          fontFamily: '"Microsoft YaHei",sans-serif',
          opacity: boxIn,
        }}
      >
        1750 亿个旋钮
      </div>
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 350,
          width: 820,
          height: 690,
          border: `4px solid ${GOLD}`,
          borderRadius: 40,
          background: "rgba(255,210,74,0.04)",
          boxShadow: "0 0 70px rgba(255,210,74,0.28), inset 0 0 60px rgba(255,210,74,0.10)",
          opacity: boxIn,
          transform: `scale(${0.92 + 0.08 * boxIn})`,
        }}
      >
        {KNOBS.map((k, i) => {
          const t = easeOut(clamp((local - (6 + k.d * 0.7)) / 14));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: k.x,
                top: k.y,
                width: k.sz,
                height: k.sz,
                borderRadius: "50%",
                background: i % 5 === 0 ? BLUE : GOLD,
                opacity: t * 0.92,
                transform: `scale(${0.2 + 0.8 * t})`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1080,
          textAlign: "center",
          fontSize: 128,
          color: GOLD,
          fontWeight: 900,
          fontFamily: '"Consolas","Microsoft YaHei",monospace',
          opacity: g,
          transform: `scale(${0.9 + 0.1 * g})`,
        }}
      >
        350 G
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1230,
          textAlign: "center",
          fontSize: 38,
          color: DIM,
          fontWeight: 700,
          fontFamily: '"Microsoft YaHei",sans-serif',
          opacity: g,
        }}
      >
        全装得下
      </div>
      <Caption text="它只占 350G，比你想的小" hi="350G" local={local} />
    </>
  );
};

/* ---------- 镜 4：一个旋钮 ---------- */
const S4: React.FC<{ local: number }> = ({ local }) => {
  const turn = easeInOut(clamp((local - 12) / 66)) * 240 - 120;
  const spin = local * 0.35;
  const show = easeOut(clamp(local / 16));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 400,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(255,210,74,0.16) 0%, rgba(255,210,74,0.04) 50%, rgba(0,0,0,0) 72%)",
          opacity: show,
        }}
      />
      {[1.34, 1.62].map((sc, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 540 - 300 * sc,
            top: 700 - 300 * sc,
            width: 600 * sc,
            height: 600 * sc,
            borderRadius: "50%",
            border: `2px solid rgba(255,210,74,${0.16 - i * 0.06})`,
            opacity: show,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 240, top: 400, width: 600, height: 600, transform: `rotate(${spin}deg)`, opacity: show }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: i % 5 === 0 ? 6 : 3,
              height: i % 5 === 0 ? 26 : 16,
              background: i % 5 === 0 ? GOLD : "#2E3A58",
              borderRadius: 2,
              marginLeft: i % 5 === 0 ? -3 : -1.5,
              transform: `translate(-50%,-50%) rotate(${i * 6}deg) translateY(272px)`,
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", left: 290, top: 450, width: 500, height: 500 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `18px solid ${WHITE}`,
            background: "radial-gradient(circle at 40% 35%, #1A2540, #070C16)",
            boxShadow: `0 0 90px ${GOLD}33`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 10,
            height: 178,
            background: GOLD,
            transformOrigin: "50% 100%",
            transform: `translate(-50%,-100%) rotate(${turn}deg)`,
            boxShadow: `0 0 30px ${GOLD}`,
            borderRadius: 5,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 42,
            height: 42,
            marginLeft: -21,
            marginTop: -21,
            borderRadius: "50%",
            background: GOLD,
            boxShadow: `0 0 30px ${GOLD}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1085,
          textAlign: "center",
          fontSize: 76,
          color: WHITE,
          fontWeight: 900,
          fontFamily: '"Consolas","Microsoft YaHei",monospace',
          textShadow: `0 0 40px ${GOLD}66`,
          opacity: show,
        }}
      >
        +0.0371
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1190,
          textAlign: "center",
          fontSize: 34,
          color: DIM,
          fontWeight: 700,
          fontFamily: '"Microsoft YaHei",sans-serif',
          opacity: show,
        }}
      >
        权重 · 往哪偏一点
      </div>
      <Caption text="一个旋钮，就是一个参数" hi="参数" local={local} />
    </>
  );
};

/* ---------- 镜 5：猫 → 狗 ---------- */
const S5: React.FC<{ local: number }> = ({ local }) => {
  const move = easeInOut(clamp((local - 44) / 44));
  const show = easeOut(clamp(local / 16));
  const fade = 1 - clamp((local - 38) / 34);
  const bar = clamp(local / 68);
  return (
    <>
      {KNOBS.slice(0, 70).map((k, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 30 + ((k.x * 1.24) % 960),
            top: 420 + ((k.y * 1.15) % 820),
            fontSize: 26 + k.sz * 1.6,
            fontWeight: 900,
            color: i % 3 === 0 ? BLUE : GOLD,
            opacity: 0.12 * show * fade,
            fontFamily: '"Microsoft YaHei",sans-serif',
          }}
        >
          {i % 2 === 0 ? "猫" : "狗"}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          height: 400,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${50 - move * 100}%`,
            top: 0,
            transform: "translateX(-50%)",
            fontSize: 300,
            fontWeight: 900,
            color: GOLD,
            fontFamily: '"Microsoft YaHei",sans-serif',
            textShadow: `0 0 90px ${GOLD}66`,
            opacity: show,
          }}
        >
          猫
        </div>
        <div
          style={{
            position: "absolute",
            left: `${150 - move * 100}%`,
            top: 0,
            transform: "translateX(-50%)",
            fontSize: 300,
            fontWeight: 900,
            color: BLUE,
            fontFamily: '"Microsoft YaHei",sans-serif',
            textShadow: `0 0 90px ${BLUE}66`,
            opacity: show,
          }}
        >
          狗
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1020,
          width: 2,
          height: 90,
          background: `linear-gradient(180deg, ${GOLD}, rgba(255,210,74,0))`,
          opacity: 0.6 * show,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 1130,
          width: 800,
          height: 14,
          background: "#141C2E",
          borderRadius: 7,
          opacity: show,
        }}
      >
        <div
          style={{
            width: `${8 + 92 * bar}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${GOLD}, ${BLUE})`,
            borderRadius: 7,
            boxShadow: `0 0 26px ${GOLD}88`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 1170,
          fontSize: 30,
          color: DIM,
          fontWeight: 700,
          fontFamily: '"Microsoft YaHei",sans-serif',
          opacity: show,
        }}
      >
        权重
      </div>
      <div
        style={{
          position: "absolute",
          right: 140,
          top: 1170,
          fontSize: 30,
          color: DIM,
          fontWeight: 700,
          fontFamily: '"Microsoft YaHei",sans-serif',
          opacity: show,
        }}
      >
        + 0.0371
      </div>
      <Caption text="拧一点点，它认的东西就变了" hi="拧一点点" local={local} />
    </>
  );
};

export const EP05: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Starfield />
      <InnerShot />
      <Audio src={staticFile("bgm_midnight.m4a")} volume={0.95} />
    </AbsoluteFill>
  );
};

/* Shot 需要把 local 传进去，单独拆一层 */
const InnerShot: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <ShotLayer start={0} dur={SHOT} fromDir="down" toDir="left" lead={0} render={(l) => <S1 local={l} />} />
      <ShotLayer start={SHOT} dur={SHOT} fromDir="right" toDir="up" lead={26} render={(l) => <S2 local={l} />} />
      <ShotLayer start={SHOT * 2} dur={SHOT} fromDir="up" toDir="right" lead={26} render={(l) => <S3 local={l} />} />
      <ShotLayer start={SHOT * 3} dur={SHOT} fromDir="left" toDir="down" lead={26} render={(l) => <S4 local={l} />} />
      <ShotLayer start={SHOT * 4} dur={SHOT} fromDir="down" toDir="down" lead={26} render={(l) => <S5 local={l} />} />
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 70,
          fontFamily: '"Microsoft YaHei",sans-serif',
          fontSize: 26,
          letterSpacing: 4,
          color: GOLD,
          opacity: 0.75,
        }}
      >
        AI 科普 · EP05 · 参数量
      </div>
      <div
        style={{
          position: "absolute",
          right: 46,
          top: 70,
          fontFamily: "monospace",
          fontSize: 24,
          color: DIM,
          opacity: 0.6,
        }}
      >
        {String(Math.min(5, Math.floor(f / SHOT) + 1)).padStart(2, "0")} / 20
      </div>
    </>
  );
};

const DIRV: Record<string, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const ShotLayer: React.FC<{
  start: number;
  dur: number;
  fromDir: string;
  toDir: string;
  lead?: number;
  render: (local: number) => React.ReactNode;
}> = ({ start, dur, fromDir, toDir, lead = 0, render }) => {
  const f = useCurrentFrame();
  const local = f - start;
  if (local < -44 || local > dur + 30) return null;
  const inP = clamp((local + lead) / 26);
  const outP = clamp((local - (dur - 26)) / 26);
  const [fx, fy] = DIRV[fromDir];
  const [tx, ty] = DIRV[toDir];
  const eIn = easeOut(inP);
  const eOut = easeInOut(outP);
  const dx = fx * (1 - eIn) * 230 + tx * eOut * 170;
  const dy = fy * (1 - eIn) * 270 + ty * eOut * 170;
  const scale = (0.84 + 0.16 * eIn) * (1 + 0.55 * eOut);
  const opacity = clamp(inP * 1.15) * (1 - eOut);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        opacity,
        willChange: "transform, opacity",
      }}
    >
      {render(local)}
    </div>
  );
};
