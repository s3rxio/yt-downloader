import React from "react";

export interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	error?: boolean;
	children?: React.ReactNode;
}
