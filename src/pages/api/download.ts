import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";

type Data = {
	url?: string;
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

	const { formats } = await ytdl.getInfo(url);

	const { url: downloadUrl } = ytdl.chooseFormat(formats, {
		quality: "highestvideo",
		filter: "video"
	});

	res.status(200).json({ url: downloadUrl });
}
