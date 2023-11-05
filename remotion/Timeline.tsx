import React, { useEffect } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, staticFile, Audio } from "remotion";

import { config } from "./config";

import { Intro } from "./Intro";
import { Asset } from "./Asset";

type Props = {
	topic: string;
	user_id: string;
	script: any;
};

export const Text2Video: React.FC<Props> = ({ topic, user_id, script }) => {
	// Preload assets
	useEffect(() => {
		const assetsPreload = [
			...script.subtitles.map((subtitle) => subtitle.images[0].split("public")[1]),
			...script.subtitles.map((subtitle) => subtitle.videos[0].split("public")[1]),
		];
		assetsPreload.forEach((asset) => {
			// If image
			if (asset.split(".")[asset.split(".").length - 1] === "jpg") {
				let image_asset = new Image();
				image_asset.src = "/public" + asset;
				(window as any)[asset] = image_asset;
			}
			// If video
			else {
				let video_asset = document.createElement("video");
				video_asset.src = "/public" + asset;
				(window as any)[asset] = video_asset;
			}
		});
	}, []);

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
			{(duration += config.intro_duration * config.fps)}

			{Object.keys(script.subtitles).map((subtitle, i) => {
				let sequence = (
					<div>
						<Sequence key={i} from={duration} durationInFrames={script.subtitles[subtitle].audio_duration.toFixed(0) * config.fps}>
							<Asset
								index={i}
								asset_type={script.subtitles[subtitle].images.length > 0 ? "image" : "video"}
								src={staticFile(script.subtitles[subtitle][script.subtitles[subtitle].images.length > 0 ? "images" : "videos"][0].split("public")[1])}
								text={script.subtitles[subtitle].text}
							/>
						</Sequence>
						<Sequence from={duration} durationInFrames={script.subtitles[subtitle].audio_duration.toFixed(0) * config.fps}>
							<Audio src={staticFile(script.subtitles[subtitle].audio_file_path.split("public")[1])} startFrom={0} />
						</Sequence>
					</div>
				);

				duration += script.subtitles[subtitle].audio_duration * config.fps;

				return sequence;
			})}
		</AbsoluteFill>
	);
};
