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

// Image and Video Generator
async function getImagesAndVideos(user_id, assetsDir, resolution=

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
					return status;
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
