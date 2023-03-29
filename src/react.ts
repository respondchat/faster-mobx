import { useEffect, useRef, useState } from "react";
import { reaction } from "./observable";

function Observer(this: any, component: any, props: any) {
	let result = useRef<any>();
	let dispose = useRef<any>();
	const forceUpdate = useState(0)[1];

	if (dispose.current) dispose.current();

	dispose.current = reaction(
		() => {
			result.current = component(props);
		},
		() => {
			forceUpdate((x) => x + 1);
		}
	);

	useEffect(() => {
		return () => {
			dispose?.current();
		};
	}, []);

	return result.current;
}

export function observer<T extends (...props: any[]) => JSX.Element>(component: T) {
	const func = Observer.bind(null, component);

	// @ts-ignore
	Object.defineProperty(func, "name", { value: component.displayName || component.name });

	return func as T;
}
