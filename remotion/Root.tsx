import React from "react";
import { Composition } from "remotion";
import { Text2Video } from "./Composition";
export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="Empty" component={Text2Video} durationInFrames={60} fps={30} width={1280} height={720} />
		</>
	);
};
