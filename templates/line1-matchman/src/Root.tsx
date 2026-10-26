import React from "react";
import { Composition } from "remotion";
import { Short } from "./Short";
import rawChars from "./chars.json";

/* 帧数跟着 chars.json 的真实配音长度走（10/21 改：以前硬编码 1969，
   改口播后必须手改代码才对得上，现在自动算，再也不漏） */
const TOTAL = Math.ceil((rawChars[rawChars.length - 1].end + 0.3) * 30);

export const Root: React.FC = () => {
  return (
    <Composition
      id="Short"
      component={Short}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};