import { ObservableMap } from "./map";
import { isSame } from "./util";

export const ObservableSymbol = Symbol.for("observable");

export let listener: Function | undefined;
export let effect: Function | undefined;
export let isInAction = false;
export let actions = new Set<Observable>();
export let trackedObservables = new Set<Observable>();
export const subscribeKey = "subscribe";

export type Key = string | symbol;

export type Observable = {
	subscriptions: Subscription[];
	target?: object;
	changed: Record<Key, any>;
};

export type Subscription = {
	effect: Function;
	key?: Key;
	listener?: Function;
};

export function observable<T extends object>(target: T): T & { subscribe: Function } {
	if (target instanceof Map) return new ObservableMap(target) as any;
	const o = {
		subscriptions: [],
		target,
		changed: {} as Record<Key, any>,
	} as Observable;

	// do not use Reflect as it is slower than direct assignment
	return new Proxy(target, {
		get(target: any, key: any) {
			if (effect) {
				// return a special function to subscribe to the observable
				if (key === subscribeKey) return () => o.subscriptions.push({ effect: effect!, listener });
				o.subscriptions.push({ effect, key, listener });
				trackedObservables.add(o);
			}

			return target[key];
		},
		set(target: any, key: any, value: any) {
			const previous = target[key];
			if (previous === value) return true; // don't notify if value is the same
			if (isSame(previous, value)) return true;

			target[key] = value;

			o.changed[key] = value;
			if (isInAction) actions.add(o);
			else notify(o);

			return true;
		},
	}) as any;
}

export const makeObservable = observable;

export function reaction(listener: Function, callback: (newValue: any) => void) {
	effect = callback;
	listener();
	const observables = [...trackedObservables];
	trackedObservables.clear();

	// dispose
	return () => {
		observables.forEach((observable) => {
			observable.subscriptions = observable.subscriptions.filter((subscription: any) => subscription.effect !== callback);
		});
	};
}

export function autorun(callback: () => void) {
	return reaction(callback, callback);
}

const notifyEffects = new Set<Function>();
const changed = new Set();

export function notify(observable: Observable) {
	if (!observable.subscriptions.length) return;
	// notifyEffects prevents effects from being called multiple times
	let error: any;
	notifyEffects.clear();
	changed.clear();
	Object.keys(observable.changed).forEach(changed.add, changed);

	observable.subscriptions.forEach((subscription) => {
		if (subscription.key && !changed.has(subscription.key as any)) return;
		if (notifyEffects.has(subscription.effect)) return;
		notifyEffects.add(subscription.effect);

		try {
			return subscription.effect(observable.changed[subscription.key!] ?? observable.target);
		} catch (e) {
			error = e;
		}
	});
	observable.changed = {};
	if (error) throw error;
}

export function notifyAll() {
	actions.forEach((x) => notify(x));
	actions.clear();
	isInAction = false;
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

	if (result instanceof Promise) return result.finally(notifyAll);

	notifyAll();

	if (error) throw error;
}
