import { ObservableMap } from "./map";

export const ObservableSymbol = Symbol("observable");

export let effect: Function | undefined;
export let isInAction = false;
export let actions = new Set<Observable>();
export let trackedObservables = new Set<Observable>();

export type Key = string | symbol;

export type Observable = {
	subscriptions: Subscription[];
	target?: object;
	changed: Record<Key, any>;
};

export type Subscription = {
	effect: Function;
	key?: Key;
};

export function observable<T extends object>(target: T): T {
	if (target instanceof Map) return new ObservableMap(target) as T;
	const o = {
		subscriptions: [],
		target,
		changed: {} as Record<Key, any>,
	} as Observable;

	// do not use Reflect as it is slower than direct assignment
	return new Proxy(target, {
		get(target: any, key: any) {
			if (effect) {
				o.subscriptions.push({ effect, key });
				trackedObservables.add(o);
			}

			return target[key];
		},
		set(target: any, key: any, value: any) {
			const previous = target[key];
			if (previous === value) return true; // don't notify if value is the same

			target[key] = value;

			o.changed[key] = value;
			if (isInAction) actions.add(o);
			else notify(o);

			return true;
		},
	}) as T;
}

export const makeObservable = observable;

export function reaction(listener: Function, callback: (newValue: any) => void) {
	const observables = trackedObservables;
	trackedObservables = new Set();
	effect = callback;
	listener();
	effect = undefined;

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

let notifyEffects = new Set<Function>();

export function notify(observable: Observable) {
	if (!observable.subscriptions.length) return;
	// notifyEffects prevents effects from being called multiple times
	let error: any;
	notifyEffects.clear();

	observable.subscriptions.forEach((subscription) => {
		if (subscription.key && !observable.changed[subscription.key!]) return;
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
