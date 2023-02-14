import ytdl from "ytdl-core";

export interface IVideoFormat {
	url: string;
	qualityLabel: ytdl.videoFormat["qualityLabel"];
	hasVideo: boolean;
	hasAudio: boolean;
}
