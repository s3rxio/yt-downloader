import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";
import * as fs from "fs";
import path from "path";
import { mergeVideoAndAudio } from "@/utils/mergeVideoAndAudio";

interface VideoFormat {
	url: string;
	qualityLabel: ytdl.videoFormat["qualityLabel"];
	hasVideo: boolean;
	hasAudio: boolean;
}

type Data = {
	url?: string;
	formats?: VideoFormat[];
	error?: string;
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
		quality: "highest",
		filter: "video"
	});

	const audio = ytdl.chooseFormat(formats, {
		quality: "highest",
		filter: "audio"
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
		return res
			.status(200)
			.json({ url: videoAndAudio.url, formats: computedFormats });
	}

	const fetchedVideo = await fetch(video.url);
	const fetchedAudio = await fetch(audio.url);

	const videoBuffer = await fetchedVideo.arrayBuffer();
	const audioBuffer = await fetchedAudio.arrayBuffer();

	const tempDirPath = path.join(process.cwd(), "public", "temp");
	const outputDirPath = path.join(process.cwd(), "public", "output");

	const outputFileName = `${videoDetails.title
		.replaceAll(/[\/\\:*?"<>|. -]+/g, "_")
		.toLowerCase()}.mp4`;

	if (!fs.existsSync(tempDirPath)) fs.mkdirSync(tempDirPath);
	if (!fs.existsSync(outputDirPath)) fs.mkdirSync(outputDirPath);

	const tempVideoPath = path.join(tempDirPath, `${Date.now()}.mp4`);
	const tempAudioPath = path.join(tempDirPath, `${Date.now()}.mp3`);
	const outputPath = path.join(outputDirPath, outputFileName);

	fs.writeFileSync(tempVideoPath, Buffer.from(videoBuffer));
	fs.writeFileSync(tempAudioPath, Buffer.from(audioBuffer));

	console.log("Temp files is created. Merging...");

	mergeVideoAndAudio(tempVideoPath, tempAudioPath, outputPath)
		.on("error", error => {
			console.log(error);
			res
				.status(200)
				.json({ url: videoAndAudio.url, formats: computedFormats });
		})
		.on("end", () => {
			const downloadUrl = `//${req.headers.host}/temp/${outputFileName}`;
			res.status(200).json({ url: downloadUrl, formats: computedFormats });

			fs.unlinkSync(tempVideoPath);
			fs.unlinkSync(tempAudioPath);
		});
}
