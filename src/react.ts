// @ts-nocheck
var React = {} as typeof import("react");
try {
	React = require("react");
} catch (error) { }
import { reaction } from "./observable";

function Observer(this: any, component: any, props: any) {
	let result = React.useRef<any>();
	let dispose = React.useRef<any>();
	const forceUpdate = React.useState(0)[1];

	let onUpdate = React.useCallback((reason: any) => {
		if (dispose.current) dispose.current();
		console.log("update", reason, component.displayName || component.name);
		forceUpdate((x) => x + 1);
	}, []);

	onUpdate.displayName = component.displayName || component.name;

	dispose.current = reaction(() => {
		result.current = component(props);
	}, onUpdate);

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
