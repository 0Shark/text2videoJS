import React from "react";
import { Composition } from "remotion";
import { Text2Video } from "./Timeline";
import { config } from "./config";

export const RemotionRoot: React.FC = () => {
  let durationInFrames = 0;

  return (
    <>
      <Composition
        id="Text2Video"
        component={Text2Video}
        durationInFrames={20}
        fps={config.fps}
        width={config.width}
        height={config.height}
        defaultProps={{
          topic: "Topic",
          user_id: "1",
          script: {},
        }}
        calculateMetadata={async ({ props }) => {
          let duration = 0;
          props.script.subtitles.forEach((subtitle) => {
            duration += subtitle.audio_duration;
          });

          return {
            durationInFrames: Math.floor(duration * config.fps),
          };
        }}
      />
    </>
  );
};
