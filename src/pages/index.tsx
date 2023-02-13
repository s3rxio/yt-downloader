import { useState } from "react";
import { Input, Button } from "@/components/UI";

const Home = () => {
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");

	function handleOnClick() {
		fetch(`api/get-video?url=${url}`, {
			method: "GET"
		})
			.then(async res => {
				const data = await res.json();
				if (data.error) return setError(data.error);
				setError("");
				// Enable this to download the file
				window.open(data.url);
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

				<Button
					onClick={() => {
						handleOnClick();
					}}
				>
					Download
				</Button>
			</div>
		</main>
	);
};

export default Home;
