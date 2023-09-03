import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
	topic: string,
	user_id: string,
	script: any,
}

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
			<div>
			</div>
		</AbsoluteFill>
	);
};
