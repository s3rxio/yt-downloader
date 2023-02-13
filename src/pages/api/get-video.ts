import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";
import * as fs from "fs";
import path from "path";
import { mergeVideoAndAudio } from "@/utils";
import fetch from "node-fetch";

interface VideoFormat {
	url: string;
	qualityLabel: ytdl.videoFormat["qualityLabel"];
	hasVideo: boolean;
	hasAudio: boolean;
}

type Data = {
	formats?: VideoFormat[];
	error?: string;
};

const createTempMedia = async (
	videoUrl: string,
	audioUrl: string,
	tempDirPath: string
) => {
	const fetchedVideo = await fetch(videoUrl);
	const fetchedAudio = await fetch(audioUrl);

	if (!fs.existsSync(tempDirPath)) fs.mkdirSync(tempDirPath);

	const tempVideoPath = path.join(tempDirPath, `${Date.now()}.mp4`);
	const tempAudioPath = path.join(tempDirPath, `${Date.now()}.mp3`);

	const videoWriteStream = fs.createWriteStream(tempVideoPath);
	const audioWriteStream = fs.createWriteStream(tempAudioPath);

	await new Promise((resolve, reject) => {
		fetchedVideo.body?.pipe(videoWriteStream);
		fetchedAudio.body?.pipe(audioWriteStream);

		fetchedVideo.body?.on("error", reject);
		fetchedAudio.body?.on("error", reject);

		videoWriteStream.on("data", data => {
			console.log(data);
		});

		videoWriteStream.on("finish", resolve);
		audioWriteStream.on("finish", resolve);
	});
	return { tempVideoPath, tempAudioPath };
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== "GET") return res.status(405).end();
	const { url } = req.query;

	if (typeof url !== "string" || !ytdl.validateURL(url))
		return res.status(400).json({ error: "Missing url" });

	const { formats, videoDetails } = await ytdl.getInfo(url);

	const videoAndAudio = ytdl.chooseFormat(formats, {
		quality: "highest",
		filter: "videoandaudio"
	});

	const video = ytdl.chooseFormat(formats, {
		quality: "highestvideo",
		filter: "videoonly"
	});

	const audio = ytdl.chooseFormat(formats, {
		quality: "highestaudio",
		filter: "audioonly"
	});

	const computedFormats: VideoFormat[] = formats.map(format => {
		const { url, qualityLabel, hasVideo, hasAudio } = format;
		return { url, qualityLabel, hasVideo, hasAudio };
	});

	if (
		videoAndAudio.height! >= video.height! &&
		videoAndAudio.fps! >= video.fps! &&
		videoAndAudio.bitrate! >= audio.bitrate!
	) {
		return res.status(200).json({ formats: computedFormats });
	}

	const tempDirPath = path.join(process.cwd(), "temp");
	const { tempVideoPath, tempAudioPath } = await createTempMedia(
		video.url,
		audio.url,
		tempDirPath
	);

	const outputDirPath = process.env.OUTPUT_DIR_PATH as string;
	const outputFileName = `${Date.now()}.mp4`;

	const outputPath = path.join(outputDirPath, outputFileName);
	if (!fs.existsSync(outputDirPath)) fs.mkdirSync(outputDirPath);

	mergeVideoAndAudio(tempVideoPath, tempAudioPath, outputPath)
		.on("error", error => {
			console.error(error);
			res.status(500).json({ formats: computedFormats });
		})
		.on("end", () => {
			const downloadUrl = `${process.env.API_URL}/output/${outputFileName}`;

			computedFormats.unshift({
				url: downloadUrl,
				qualityLabel: video.qualityLabel,
				hasVideo: true,
				hasAudio: true
			});

			console.log(computedFormats);

			res.status(200).json({ formats: computedFormats });

			fs.unlinkSync(tempVideoPath);
			fs.unlinkSync(tempAudioPath);
		});
}
