import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

// The composition you want to render
const compositionId = "Text2Video";

// You only have to create a bundle once, and you may reuse it
const bundleLocation = await bundle({
	entryPoint: path.resolve("./remotion/index.ts"),
	// If you have a Webpack override, make sure to add it here
	webpackOverride: (config) => config,
});

export default async function VideoGen(topic, user_id) {
  const script = prepareAssets(user_id);

  if (!script) {
		return false;
	}

  const inputProps = {
		topic: topic,
		user_id: user_id,
		script: script,
	};

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  // Render the video
  await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: "h264",
		outputLocation: `public/renders/${user_id}.mp4`,
		inputProps,
    verbose: true,
    concurrency: 1,
	});

  return true;
}

function prepareAssets(user_id) {
	const assetsDir = path.resolve(`./public/videos/${user_id}`);

	if (!fs.existsSync(assetsDir)) {
		console.log("Assets directory doesn't exist for user " + user_id);
		return false;
	}

  let script = fs.readFileSync(assetsDir + "/script.json", "utf8");
  script = JSON.parse(script);
  
  script.subtitles.forEach((subtitle, index) => {
    subtitle.images = [];
    subtitle.videos = [];
    
    const subtitleDir = assetsDir + "/assets/subtitle_" + index;
    const subtitleAssets = fs.readdirSync(subtitleDir);

    subtitleAssets.forEach((asset) => {
      if (asset.startsWith("image")) {
        subtitle.images.push(subtitleDir + "/" + asset);
      } else if (asset.startsWith("video")) {
        subtitle.videos.push(subtitleDir + "/" + asset);
      }
    });
  });

  // Save the updated script
  fs.writeFileSync(assetsDir + "/script.json", JSON.stringify(script));

	return script;
}