import React, { FC } from "react";
import clsx from "clsx";
import {IButton} from "@/types";

const Button: FC<IButton> = ({ className, children, error, ...props }) => {
	return (
		<button
			className={clsx(
				"bg-gray-200 px-4 py-2 font-medium rounded-lg transition-colors border hover:bg-gray-400/25",
				error ? " border-red-500" : null,
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
