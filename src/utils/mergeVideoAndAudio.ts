import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

export const mergeVideoAndAudio = (
	video: string,
	audio: string,
	outputPath: string
) => {
	ffmpeg.setFfmpegPath(path);
	return ffmpeg()
		.addInput(video)
		.addInput(audio)
		.addOptions(["-map 0:v", "-map 1:a", "-c:v copy"])
		.save(outputPath);
};
