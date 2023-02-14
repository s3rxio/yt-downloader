import React from "react";

export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
	value?: string;
}
