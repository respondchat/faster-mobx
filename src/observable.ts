// import { ObservableMap } from "./map";
import { isSame } from "./util";

export const ObservableSymbol = Symbol.for("observable");

export type Effect = (value: any) => void;
export type ObservObject = any;
/** Object that contains all unique effects for a specific key */
export type InternalObservable = Record<Key, Set<Effect>>;
export let listener: Function | undefined;
export let effect: Effect | undefined;
export let isInAction = false;
/** map that contains all changed observables and their effects */
export const changed = new Map<Effect, { target: ObservObject; effects: Effect[]; key?: any; value?: any }>();
/** set that contains all effects where the whole object is subscribed */
export const subscribed = new Map<Effect, { target: ObservObject; effects: Effect[] }>();
export const subscribeKey = "subscribe";

export type Key = string | symbol;

export function observable<T extends object>(target: T): T & { subscribe: void } {
	// if (target instanceof Map) return new ObservableMap(target) as any;
	const effects = [] as Effect[];

	// do not use Reflect as it is slower than direct assignment
	return new Proxy(target, {
		get(target: any, key: any) {
			if (effect) {
				if (subscribed.has(effect)) return target[key];
				subscribed.set(effect, { target, effects });
				effects.push(effect); // @ts-ignore
			}

			return target[key];
		},
		set(target: any, key: any, value: any) {
			const previous = target[key];
			if (previous === value) return true; // don't notify if value is the same
			if (isSame(previous, value)) return true;

			target[key] = value;

			if (isInAction) {
				effects.forEach((effect) => {
					changed.set(effect, { target, effects, key, value });
				});
			} else {
				setImmediate(() => {
					// copy is needed, because effect could cause a clean up in reaction, which would modify the array while iterating resulting in missing effects
					let e = [...effects];
					e.forEach((effect) => {
						effect({ target, key, value, effects });
					});
				});
			}

			return true;
		},
	}) as any;
}

export const makeObservable = observable;

export function reaction(listener: Function, callback: (newValue: any) => void) {
	effect = callback;
	listener();
	effect = undefined;

	// dispose
	return () => {
		const entry = subscribed.get(callback);
		if (entry) {
			const index = entry.effects.indexOf(callback);
			if (index !== -1) entry.effects.splice(index, 1);
		}
		changed.delete(callback);
		subscribed.delete(callback);
	};
}

export function autorun(callback: () => void) {
	return reaction(callback, callback);
}

export function notifyAll() {
	setImmediate(() => {
		changed.forEach((value, effect) => {
			effect(value);
		});
		changed.clear();
	});
}

export function runInAction(fn: Function) {
	// another action is already executing -> combine them into one action
	if (isInAction) return fn();
	isInAction = true;
	let error: any;
	try {
		var result = fn();
	} catch (e) {
		error = e;
	}
	isInAction = false;

	if (result instanceof Promise) return result.finally(notifyAll);

	notifyAll();

	if (error) throw error;

	return result;
}
