// @ts-nocheck
var React = {} as typeof import("react")
try {
	React = require("react")
} catch (error) { }
import { reaction } from "./observable";

function Observer(this: any, component: any, props: any) {
	let result = React.useRef<any>();
	let dispose = React.useRef<any>();
	const forceUpdate = React.useState(0)[1];

	if (dispose.current) dispose.current();

	dispose.current = reaction(
		() => {
			result.current = component(props);
		},
		() => {
			forceUpdate((x) => x + 1);
		}
	);

	React.useEffect(() => {
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
