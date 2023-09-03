import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

import { config } from "./config";

import { Intro } from "./Intro";
import { Asset } from "./Asset";

type Props = {
  topic: string;
  user_id: string;
  script: any;
};

export const Text2Video: React.FC<Props> = ({ topic, user_id, script }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - 10,
    config: {
      damping: 100,
    },
  });

  const opacity = interpolate(frame, [30, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const moveY = interpolate(frame, [20, 30], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let duration = 0;

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        backgroundColor: "white",
        fontWeight: "bold",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Sequence from={0} durationInFrames={config.intro_duration * config.fps}>
        <Intro title={topic} />
      </Sequence>
      {(duration += config.intro_duration)}
      {Object.keys(script.subtitles).map((subtitle, i) => {
        if (script.subtitles[subtitle].images.length > 0) {
          return (
            <Sequence
              key={i}
              from={duration * config.fps}
              durationInFrames={
                script.subtitles[subtitle].audio_duration * config.fps
              }
            >
              <Asset
                asset_type="image"
                src={script.subtitles[subtitle].images[0]}
                text={script.subtitles[subtitle].text}
              />
            </Sequence>
          );
        }

		if (script.subtitles[subtitle].videos.length > 0) {
		  return (
			<Sequence
			  key={i}
			  from={duration * config.fps}
			  durationInFrames={
				script.subtitles[subtitle].audio_duration * config.fps
			  }
			>
			  <Asset
				asset_type="video"
				src={script.subtitles[subtitle].videos[0]}
				text={script.subtitles[subtitle].text}
			  />
			</Sequence>
		  );
		}
      })}
    </AbsoluteFill>
  );
};
