import React, { FC } from "react";
import clsx from "clsx";

export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
	value?: string;
}

const Input: FC<IInput> = ({ className, value, error, ...props }) => {
	return (
		<input
			className={clsx(
				"w-full bg-gray-200 p-2 rounded-lg border border-black/10 outline-none",
				error ? " border-red-500" : null,
				className
			)}
			placeholder={"Enter youtube video url"}
			value={value}
			{...props}
		/>
	);
};

export default Input;
