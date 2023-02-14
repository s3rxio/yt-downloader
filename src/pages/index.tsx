import { useState } from "react";
import { Input, Button } from "@/components/UI";
import { IVideoFormat } from "@/types";
import { MoreVideoDetails } from "ytdl-core";

const Home = () => {
	const [url, setUrl] = useState("");
	const [videoDetails, setVideoDetails] = useState<MoreVideoDetails>(
		{} as MoreVideoDetails
	);
	const [formats, setFormats] = useState<IVideoFormat[]>([]);
	const [error, setError] = useState("");

	function handleOnClick() {
		fetch(`api/get-video?url=${url}`, {
			method: "GET"
		})
			.then(async res => {
				const data = await res.json();
				if (data.error) return setError(data.error);
				setError("");
				setVideoDetails(data.videoDetails);
				setFormats(data.formats);
			})
			.catch(err => {
				setError(err.message);
			});
	}

	return (
		<main id={"main"}>
			<div className="flex flex-col justify-center items-center bg-gray-100 p-6 rounded-2xl gap-2">
				<h1 className={"text-xl font-bold mb-1"}>
					Get youtube video download link!
				</h1>
				<p className={"text-red-500"}>{error}</p>

				<Input
					type={"url"}
					placeholder={"Enter youtube video url"}
					value={url}
					onChange={ev => setUrl(ev.target.value)}
				/>

				<Button onClick={() => handleOnClick()}>Download</Button>
			</div>
		</main>
	);
};

export default Home;
