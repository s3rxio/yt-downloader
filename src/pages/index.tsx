import { useState } from "react";

export default function Home() {
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");

	return (
		<main id={"main"}>
			<div className="flex flex-col justify-center items-center bg-gray-100 p-6 rounded-2xl gap-4">
				<h1 className={"text-xl font-bold mb-1"}>
					Get youtube video download link!
				</h1>
				<p className={"text-red-500"}>{error}</p>
				<input
					type="text"
					className={
						"w-full bg-gray-200 p-2 rounded-lg border border-black/10 outline-none" +
						(error ? " border-red-500" : "")
					}
					placeholder={"Enter youtube video url"}
					value={url}
					onChange={ev => setUrl(ev.target.value)}
				/>

				<button
					className={
						"bg-gray-200 px-4 py-2 font-medium rounded-lg transition-colors border hover:bg-gray-400/25"
					}
					onClick={() => {
						fetch(`api/download?url=${url}`, {
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
					}}
				>
					Download
				</button>
			</div>
		</main>
	);
}
