import dotenv from "dotenv";
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

						// Update the script with the audio file path and duration
						script.subtitles[i].audio_file_path = audioFilePath;
						script.subtitles[i].audio_duration = result.audioDuration / 10000000;

						// Save the updated script
						fs.writeFileSync(script_path, JSON.stringify(script));

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

// Image and Video Generator
async function getImagesAndVideos(user_id, assetsDir) {
	try {
		const script_path = path.join(assetsDir, "/script.json");
		const script = JSON.parse(fs.readFileSync(script_path));

		const subtitleAssetsDir = path.join(assetsDir, "/assets");

		if (!fs.existsSync(subtitleAssetsDir)) {
			fs.mkdirSync(subtitleAssetsDir);
		}

		for (let i = 0; i < script.subtitles.length; i++) {
			const subtitle = script.subtitles[i];
			const subtitleDir = path.join(subtitleAssetsDir, `/subtitle_${i}`);

			if (!fs.existsSync(subtitleDir)) {
				fs.mkdirSync(subtitleDir);
			}

			const imgScreenTime = 3;
			const videoScreenTime = 5;
			const duration = subtitle.audio_duration;

			const imageTags = subtitle.search_tags;

			const videoTags = subtitle.search_tags;
			const videoCount = Math.floor(duration / videoScreenTime);
			const videoOrientation = "landscape";
			const videoSize = "medium";

			const videos = await getStockVideos(videoTags, videoCount, videoOrientation, videoSize);

			// Fill the rest of the segment with images
			const imageCount = Math.floor((duration - videoCount * videoScreenTime) / imgScreenTime);
			const imageOrientation = "landscape";
			const imageSize = "medium";

			const images = await getStockImages(imageTags, imageCount, imageOrientation, imageSize);

			for (let i = 0; i < images.length; i++) {
				await getImage(images[i], i, subtitleDir);
			}

			for (let i = 0; i < videos.length; i++) {
				await getVideo(videos[i], i, subtitleDir);
			}
		}

		return true;
	} catch (error) {
		console.log(`[ERROR] Couldn't generate images and videos for user ${user_id}`);
		console.log(error);
		return false;
	}
}

// Get image from URL
async function getImage(url, id, subtitleDir) {
	// Get buffer from URL
	const imageBlob = await fetch(url).then((response) => response.blob());
	imageBlob.arrayBuffer().then((array_buffer) => {
		const buffer = Buffer.from(array_buffer);
		const imagePath = path.join(subtitleDir, `image_${id}.jpg`);
		// Save the blob to a file
		fs.writeFileSync(imagePath, buffer);
	});
}

async function getVideo(url, id, subtitleDir) {
	const videoBlob = await fetch(url).then((response) => response.blob());
	videoBlob.arrayBuffer().then((array_buffer) => {
		const buffer = Buffer.from(array_buffer);
		const videoPath = path.join(subtitleDir, `video_${id}.mp4`);
		// Save the blob to a file
		fs.writeFileSync(videoPath, buffer);
	});
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
		"https://api.pexels.com/v1/search?query=" + tagsQuery + "&per_page=" + count.toString() + "&orientation=" + orientation + "&size=" + size.toString(),
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
		"https://api.pexels.com/videos/search?query=" + tagsQuery + "&orientation=" + orientation + "&size=" + size.toString() + "&per_page=" + count.toString(),
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
