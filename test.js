import AssetsGen from "./assets-gen.js";
import VideoGen from "./video-gen.js";

let topic = "Why drinking coffee is good for your health";
let user_id = "test";

await AssetsGen(topic, user_id).then((status) => {
	if (status) {
		(async () => {
			await VideoGen(topic, user_id).then((status) => {
				if (status) {
					console.log("Video generation complete");
				} else {
					console.log("Video generation failed");
				}
			});
		})();
	} else {
		console.log("Asset generation failed");
	}
});
