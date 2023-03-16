import { ReactElement, useEffect, useRef, useState } from "react";
import { reaction } from "./observable";

export function observer<T extends (...props: any[]) => JSX.Element>(component: T) {
	return function observer(props: any) {
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

		return result.current as ReactElement;
	} as T;
}
