import React from 'react';
import { Composition, Audio, staticFile } from 'remotion';
import { AIKp2 } from './AIKp2';
import { Live } from './Live';
import { Quality } from './Quality';
import { AIP3 } from './AIP3';
import { AIP4 } from './AIP4';
import { AIP5 } from './AIP5';
import { NN1 } from './NN1';
import { NN2 } from './NN2';
import { NNV, CoverNNV } from './NNV';
import { NNV2, CoverNNV2 } from './NNV2';
import { NN2V3, CoverNN2V3 } from './NN2V3';
import { AIKp3 } from './AIKp3';
import { TOTAL_FRAMES as EP2V3_FRAMES } from './ep2v3Timeline';
import { TOTAL_FRAMES as EP3_OPEN_FRAMES } from './ep3Timeline';
import { TOTAL_FRAMES as EP2_FRAMES } from './ep2Timeline';
import { Repeat } from './Repeat';
import { EP04 } from './EP04';
import { EP04F } from './EP04Full';
import { TOTAL_FRAMES as EP4_FRAMES } from './ep4Timeline';
import { TOTAL_FRAMES as EP4F_FRAMES } from './ep4fChars';
import { Cover } from './Cover';
import { CoverNN } from './CoverNN';
import { AIWar } from './AIWar';
import { AIKp3V2 } from './AIKp3V2';
import { AIKp3V3 } from './AIKp3V3';
import { EP05 } from './EP05';
import { EP04V2, EP04V2_FRAMES } from './EP04V2';
import { EP05F } from './EP05Full';
import { EP06F, EP6F_FRAMES } from './EP06Full';
import { EP06P } from './EP06P';
import { EP06V2 } from './EP06V2';
import { EP06V3 } from './EP06V3';
import { EP06V4 } from './EP06V4';
import { EP07P } from './EP07P';
import { EP07T } from './EP07T';
import { EP07 } from './EP07';
import { EP07X } from './EP07X';
import { EP07M } from './EP07M';
import { EP07R } from './EP07R';
import { EP07C } from './EP07C';
import { EP07F } from './EP07F';
import { EP07G } from './EP07G';
import { EP07I } from './EP07I';
import { EP07Intro, EP07Outro, EP07IP } from './EP07JO';
import { TOTAL_FRAMES as EP5F_FRAMES } from './ep5fCues';
import { TOTAL_FRAMES as REPEAT_FRAMES } from './repeatScript';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Short" component={AIKp2} durationInFrames={2280} fps={30} width={1080} height={1920} />
      <Composition id="Live" component={Live} durationInFrames={360} fps={30} width={1080} height={1920} />
      <Composition id="Quality" component={Quality} durationInFrames={360} fps={30} width={1080} height={1920} />
      <Composition id="P3" component={AIP3} durationInFrames={2275} fps={30} width={1080} height={1920} />
      <Composition id="P5" component={AIP5} durationInFrames={3072} fps={30} width={1080} height={1920} />
      <Composition id="NN1" component={NN1} durationInFrames={5379} fps={30} width={1920} height={1080} />
      <Composition id="NN1H" component={NN1} defaultProps={{ hard: true }} durationInFrames={5379} fps={30} width={1920} height={1080} />
      <Composition id="NN2" component={NN2} durationInFrames={EP2_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="NNV" component={NNV} durationInFrames={1570} fps={30} width={1080} height={1920} />
      <Composition id="CoverNNV" component={CoverNNV} durationInFrames={30} fps={30} width={1080} height={1920} />
      <Composition id="NNV2" component={NNV2} durationInFrames={1512} fps={30} width={1080} height={1920} />
      <Composition id="NN2V3" component={NN2V3} durationInFrames={EP2V3_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="KP3" component={AIKp3} durationInFrames={EP3_OPEN_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="CoverNN2V3" component={CoverNN2V3} durationInFrames={30} fps={30} width={1080} height={1080} />
      <Composition id="CoverNNV2" component={CoverNNV2} durationInFrames={30} fps={30} width={1080} height={1920} />
      <Composition id="Cover" component={Cover} durationInFrames={30} fps={30} width={1080} height={1080} />
      <Composition id="CoverNN" component={CoverNN} durationInFrames={30} fps={30} width={1080} height={1080} />
      <Composition id="Repeat" component={Repeat} durationInFrames={REPEAT_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="EP04" component={EP04} durationInFrames={EP4_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="EP04F" component={EP04F} durationInFrames={EP4F_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="AIWar" component={AIWar} durationInFrames={3300} fps={30} width={1920} height={1080} />
      <Composition id="KP3V2" component={AIKp3V2} durationInFrames={2016} fps={30} width={1080} height={1920} />`n      <Composition id="KP3V3" component={AIKp3V3} durationInFrames={2016} fps={30} width={1080} height={1920} />
      <Composition id="EP05" component={EP05} durationInFrames={540} fps={30} width={1080} height={1920} />
      <Composition id="EP04V2" component={EP04V2} durationInFrames={EP04V2_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="EP05F" component={EP05F} durationInFrames={EP5F_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="EP06F" component={EP06F} durationInFrames={EP6F_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="EP06P" component={EP06P} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="EP06V2" component={EP06V2} durationInFrames={1890} fps={30} width={1080} height={1920} />
      <Composition id="EP06V3" component={EP06V3} durationInFrames={1845} fps={30} width={1080} height={1920} />
      <Composition id="EP06V4" component={EP06V4} durationInFrames={1710} fps={30} width={1080} height={1920} />
      <Composition id="EP07P" component={EP07P} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="EP07T" component={EP07T} durationInFrames={270} fps={30} width={1080} height={1920} />
      <Composition id="EP07" component={EP07} durationInFrames={1470} fps={30} width={1080} height={1920} />
      <Composition id="EP07X" component={EP07X} durationInFrames={840} fps={30} width={1080} height={1920} />
      <Composition id="EP07M" component={EP07M} durationInFrames={600} fps={30} width={1080} height={1920} />
      <Composition id="EP07R" component={EP07R} durationInFrames={900} fps={30} width={1080} height={1920} />
      <Composition id="EP07C" component={EP07C} durationInFrames={582} fps={30} width={1080} height={1920} />
      <Composition id="EP07F" component={EP07F} durationInFrames={360} fps={30} width={1080} height={1920} />
      <Composition id="EP07G" component={EP07G} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="EP07I" component={EP07I} durationInFrames={720} fps={30} width={1080} height={1920} />
      <Composition id="EP07Intro" component={EP07Intro} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="EP07IP" component={EP07IP} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="EP07Outro" component={EP07Outro} durationInFrames={270} fps={30} width={1080} height={1920} />
    </>
  );
};


