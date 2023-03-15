import { createElement, forwardRef, memo } from "react";
import { autorun } from "./observable";

export function observer<T>(component: T) {
	return memo(
		forwardRef((props, ref) => {
			let result: any;
			autorun(() => {
				result = createElement(component as any, { ...props, ref });
			});
			return result;
		})
	) as T;
}
