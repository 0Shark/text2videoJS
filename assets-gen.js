import dotenv from "dotenv";
import fileSaver from "file-saver";
import fs from "fs";
import path from "path";
import { Configuration, OpenAIApi } from "openai";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

dotenv.config();



// OpenAI API
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const __dirname = path.resolve();
console.log(__dirname);

// Prepare directory for assets inside videos folder add a folder with the user_id
function prepareAssetsDir(user_id) {
	// Create videos folder if it doesn't exist
	const videosDir = path.join(__dirname, "videos");

	if (!fs.existsSync(videosDir)) {
		fs.mkdirSync(videosDir);
	}

	const assetsDir = path.join(__dirname, "videos", user_id);

	if (!fs.existsSync(assetsDir)) {
		fs.mkdirSync(assetsDir);

		return assetsDir;
	} else {
		console.log("Assets directory already exists for user " + user_id);
		return assetsDir;
	}
}

// Script Generator
async function getVideoScript(topic, user_id, assetsDir) {
	console.log("Generating script: Topic: " + topic + " User: " + user_id);
	let context = [];

	context.push({
		role: "system",
		content:
			"You are an AI video generation machine that gets only 1 topic and gives out a JSON output with the following format: { 'topic': '{Given topic...}', 'subtitles': [ { 'text': 'Bla bla bla', 'search_tags': ['thing', 'something', 'big thing' ... and more tags ], } , { more subtitles... ] } The output should be only the JSON text and should always stick to the format without changing the dictionary keys or the structure of the JSON. The JSON output should be all in A SINGLE COMPACT LINE WITHOUT NEW LINES to preserve token size. The amount of subtitles should be such so it fits inside a 1 minute video, so 300 words is enough. JSON should be valid at all times. Use double quotes instead of single quotes for the JSON.",
	});

	context.push({
		role: "user",
		content: topic,
	});

	try {
		const completion = await openai
			.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: context,
			})
			.then((completion) => {
				try {
					// console.log(completion.data.choices[0].message.content);
					// Try to parse the script as JSON

					JSON.parse(completion.data.choices[0].message.content);

					// Save script to file
					const script_path = path.join(assetsDir, "/script.json");
					fs.writeFileSync(script_path, completion.data.choices[0].message.content);

					return script_path;
				} catch (error) {
					console.log("[ERROR] Couldn't parse script as JSON for user " + user_id);
					console.log(error);
					console.log(completion.data.choices[0].message.content);

					return false;
				}
			});
	} catch (error) {
		console.log("[ERROR] Couldn't generate script for user " + user_id);
		console.log(error);

		return false;
	}
}

// Audio Generator
async function getAudioTTS(user_id, assetsDir) {
	const script_path = path.join(assetsDir, "/script.json");

	try {
		const script = JSON.parse(fs.readFileSync(script_path));

		// Create audio subfolder
		const audioDir = path.join(assetsDir, "/audio");

		if (!fs.existsSync(audioDir)) {
			fs.mkdirSync(audioDir);
		}

		let speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY, process.env.AZURE_SPEECH_REGION);

		speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
		// Create audio files
		const audioFiles = [];
		for (let i = 0; i < script.subtitles.length; i++) {
			const subtitle = script.subtitles[i];
			const audioFilePath = path.join(audioDir, `/subtitle_${i}.wav`);
			const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
			const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

			// Wrap the speakTextAsync in a promise for better error handling
			const result = await new Promise((resolve, reject) => {
				synthesizer.speakTextAsync(subtitle.text, function (result) {
					if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
						audioFiles.push(audioFilePath);
						resolve(result);
					} else {
						console.log(`Audio synthesis canceled for subtitle ${i}: ${subtitle.text}`);
						audioFiles.push(null);
						reject(result);
					}
				});
			}).catch((error) => {
				console.log(`[ERROR] Couldn't generate audio for subtitle ${i} for user ${user_id}`);
				console.log(error);
			});

			synthesizer.close();
		}
	} catch (error) {
		console.log(`[ERROR] Couldn't generate audio for user ${user_id}`);
		console.log(error);

		return false;
	}
}

/*
# Photo and video assets
def get_stock_images(video_id, part_number, part_tags, image_count, orientation, asset_size):
    api_key = os.getenv("PEXELS_API_KEY")
    # Perform search with the tags joined by a + sign
    response = requests.get("https://api.pexels.com/v1/search?query=" + "+".join(part_tags) + "&per_page=" +
                            str(image_count) + "&orientation=" +
                            orientation + "&size=" + str(asset_size),
                            headers={"Authorization": api_key})
    # Get images
    images = response.json()["photos"]
    # Get image URLs
    image_urls = [image["src"]["original"] for image in images]
    # Download images
    for i in range(0, len(image_urls)):
        # Get image
        image = requests.get(image_urls[i])
        # Save image
        with open("videos/" + video_id + "/p" + str(part_number) + "/img/" + str(i) + ".jpg", "wb") as f:
            f.write(image.content)


def get_stock_videos(video_id, part_number, part_tags, video_count, orientation, asset_size):

    api_key = os.getenv("PEXELS_API_KEY")

    response = requests.get("https://api.pexels.com/videos/search?query=" + "+".join(
        part_tags) + "&orientation=" + orientation + "&size=" + str(asset_size) + "&per_page=" + str(video_count),
        headers={"Authorization": api_key})
    # Get videos
    videos = response.json()["videos"]

    # Get video URLs
    video_urls = [video["video_files"][0]["link"] for video in videos]

    # Download videos
    for i in range(0, video_count):
        # Get video
        video = requests.get(video_urls[i])
        # Save video
        with open("videos/" + video_id + "/p" + str(part_number) + "/video/" + str(i) + ".mp4", "wb") as f:
            f.write(video.content)
*/

// Image and Video Generator
async function getImagesAndVideos(user_id, assetsDir, width=1280, height=720) {
	const script_path = path.join(assetsDir, "/script.json");

	console.log("Generating images and videos: User: " + user_id);

	// Get 1 short video and 1 image for each subtitle based on the search_tags
	try {
		const script = JSON.parse(fs.readFileSync(script_path));

		// Create images and videos subfolders
		const imagesDir = path.join(assetsDir, "/images");
		const videosDir = path.join(assetsDir, "/videos");

		if (!fs.existsSync(imagesDir)) {
			fs.mkdirSync(imagesDir);
		}

		if (!fs.existsSync(videosDir)) {
			fs.mkdirSync(videosDir);
		}

		// Get images and videos for each subtitle
		for (let i = 0; i < script.subtitles.length; i++) {
			const subtitle = script.subtitles[i];

			// Create subtitle folder
			const subtitleDir = path.join(imagesDir, `/subtitle_${i}`);

			if (!fs.existsSync(subtitleDir)) {
				fs.mkdirSync(subtitleDir);
			}

			// Get images
			const imageTags = subtitle.search_tags;
			const imageCount = 2;
			const imageOrientation = "landscape";
			const imageSize = "medium";

			const images = await getStockImages(imageTags, imageCount, imageOrientation, imageSize).then((images) => {
				return images;
			});

			// Get videos
			const videoTags = subtitle.search_tags;
			const videoCount = 1;
			const videoOrientation = "landscape";
			const videoSize = "medium";

			const videos = await getStockVideos(videoTags, videoCount, videoOrientation, videoSize).then((videos) => {
				return videos;
			});

			// Download images
			for (let i = 0; i < images.length; i++) {
				// Get image
				const image = await getImage(images[i], i).then((image) => {
					return image;
				});

				// Save image
				const imagePath = path.join(subtitleDir, `/image_${i}.jpg`);

				// save blob to file

				fs.writeFileSync(imagePath, image);
			}

			// Download videos
			for (let i = 0; i < videos.length; i++) {
				// Get video
				const video = await getVideo(videos[i], i).then((video) => {
					return video;
				});

				// Save video
				const videoPath = path.join(subtitleDir, `/video_${i}.mp4`);
				fs.writeFileSync(videoPath, video);
			}
		}
	} catch (error) {
		console.log(`[ERROR] Couldn't generate images and videos for user ${user_id}`);
		console.log(error);

		return false;
	}
}

// Get images from Pexels
async function getStockImages(tags, count, orientation, size) {
	const api_key = process.env.PEXELS_API_KEY;

	let tagsQuery = "";

	for (const tag of tags) {
		tagsQuery += tag + "+";
	}

	// Perform search with the tags joined by a + sign
	const response = await fetch(
		"https://api.pexels.com/v1/search?query=" +
			tagsQuery +
			"&per_page=" +
			count.toString() +
			"&orientation=" +
			orientation +
			"&size=" +
			size.toString(),
		{
			headers: {
				Authorization: api_key,
			},
		}
	).then((response) => {
		return response.json();
	});

	// Get images
	const images = response.photos;

	// Get image URLs
	const image_urls = [];

	for (const image of images) {
		image_urls.push(image.src.original);
	}

	return image_urls;
}

// Get videos from Pexels
async function getStockVideos(tags, count, orientation, size) {
	const api_key = process.env.PEXELS_API_KEY;

	let tagsQuery = "";

	for (const tag of tags) {
		tagsQuery += tag + "+";
	}

	// Perform search with the tags joined by a + sign
	const response = await fetch(
		"https://api.pexels.com/videos/search?query=" +
			tagsQuery +
			"&orientation=" +
			orientation +
			"&size=" +
			size.toString() +
			"&per_page=" +
			count.toString(),
		{
			headers: {
				Authorization: api_key,
			},
		}
	).then((response) => {
		return response.json();
	});

	// Get videos
	const videos = response.videos;

	// Get video URLs
	const video_urls = [];

	for (const video of videos) {
		video_urls.push(video.video_files[0].link);
	}

	return video_urls;
}

// Get image from URL
async function getImage(url, id) {
	const image = await fetch(url).then((response) => {
		return response.blob();
	});

	return fileSaver.saveAs(new Blob([image], { type: "image/jpeg" }), "image_" + id + ".jpg");
}

// Get video from URL
async function getVideo(url, id) {
	const video = await fetch(url).then((response) => {
		return response.blob();
	});

	return fileSaver.saveAs(new Blob([video], { type: "video/mp4" }), "video_" + id + ".mp4");
}

export async function AssetsGen(topic, user_id) {
	try {
		const assetsDir = prepareAssetsDir(user_id);
		if (!assetsDir) {
			return false;
		}

		const status = await getVideoScript(topic, user_id, assetsDir)
			.then(() => {
				console.log("Generating audio for user " + user_id);
				const audioStatus = getAudioTTS(user_id, assetsDir).then((status) => {
					console.log("Generating images and videos for user " + user_id);
					const imagesAndVideosStatus = getImagesAndVideos(user_id, assetsDir).then((status) => {
						return "status complete";
					});
				});
			})
			.catch((error) => {
				console.log("[ERROR] Couldn't generate assets for user " + user_id);
				console.log(error);

				return false;
			});
	} catch (error) {
		console.log("[ERROR] An error occurred during asset generation:");
		console.log(error);
		return false;
	}
}
