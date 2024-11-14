import { isSame, isSameDeep } from "./util";

export const ObservableSymbol = Symbol.for("observable");

export type Effect = (value: any) => void;
export type Effects = Map<Key, Set<Effect>>;
export type ObservObject = any;
export type Observable<T> = T & { subscribe: T; value: T };
export let listener: Function | undefined;
export let effect: Effect | undefined;
export let isInAction = false;
/** map that contains all changed observables and their effects */
export const changed = new Map<Set<Effect>, Reason>();
/** set that contains all effects where the whole object is subscribed */
export const subscribed = new Map<Effect, Set<Effects>>();
export const subscribeKey = "subscribe";
export const valueKey = "value";

export type Reason = { target: ObservObject; effects: Effects; key?: any; value?: any; previous?: any };

export type Key = string | symbol;

export function triggerValueSet(effects: Effects, target: any, key: any, value: any, previous: any) {
	const reason = { target, effects, key, value, previous };

	if (isInAction) {
		let set = effects.get(subscribeKey);
		if (set) changed.set(set, reason);

		set = effects.get(key);
		if (set) changed.set(set, reason);
	} else {
		// copy is needed, because effect could cause a clean up in reaction, which would modify the array while iterating resulting in missing effects

		let iterator = effects.get(subscribeKey);
		if (iterator) {
			[...iterator].forEach((effect) => effect(reason));
		}
		iterator = effects.get(key);
		if (iterator) {
			[...iterator].forEach((effect) => effect(reason));
		}
	}
}

export function observable<T extends object>(target: T): T & { subscribe: T } {
	// if (target instanceof Map) return new ObservableMap(target) as any;
	const effects = new Map() as Effects;

	// do not use Reflect as it is slower than direct assignment
	return new Proxy(target, {
		get(target: any, key: any) {
			if (key === valueKey) return target;
			if (effect) {
				var set = effects.get(key);
				if (!set) {
					set = new Set();
					effects.set(key, set);
				}
				set.add(effect);
				let sub = subscribed.get(effect);
				if (!sub) {
					sub = new Set();
					subscribed.set(effect, sub);
				}
				sub.add(effects);
			}
			if (key === subscribeKey) return target;

			return target[key];
		},
		set(target: any, key: any, value: any) {
			const previous = target[key];
			target[key] = value;

			if (isSameDeep(previous, value)) return true; // don't notify if value is the same

			triggerValueSet(effects, target, key, value, previous);

			return true;
		},
		deleteProperty(target, p) {
			const previous = target[p];
			delete target[p];

			triggerValueSet(effects, target, p, undefined, previous);

			return true;
		},
	}) as any;
}

export const makeObservable = observable;

export function reaction(listener: Function, callback: (reason: Reason) => void) {
	if (!subscribed.has(callback)) subscribed.set(callback, new Set());

	let previousEffect = effect;
	effect = callback;
	listener();
	effect = previousEffect;

	// dispose
	return () => {
		const sets = subscribed.get(callback);
		sets?.forEach((set) => {
			set.forEach((effects, key) => {
				effects.delete(callback);
				if (effects.size === 0) set.delete(key);
			});
		});
		subscribed.delete(callback);
		changed.forEach((reason, set) => {
			set.delete(callback);
		});
	};
}

export function autorun(callback: (reason?: Reason) => void) {
	return reaction(callback, callback);
}

let called = new Set<Effect>();

export function notifyAll() {
	setTimeout(() => {
		called.clear();
		[...changed.entries()].forEach(([effects, reason]) => {
			[...effects].forEach((effect) => {
				if (called.has(effect)) return;
				called.add(effect);
				effect(reason);
			});
		});
		changed.clear();
	});
}
let actionDepth = 0;

export async function runInAction(fn: Function) {
	actionDepth++;
	let error: any;
	let result: any;

	try {
		result = await fn();
	} catch (e) {
		error = e;
	}

	actionDepth--;

	if (actionDepth <= 0) {
		actionDepth = 0;
		if (result instanceof Promise) {
			return result.finally(notifyAll);
		}
		notifyAll();
	}

	if (error) throw error;

	return result;
}
