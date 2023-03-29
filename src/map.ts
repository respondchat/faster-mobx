import { actions, effect, isInAction, Key, notify, trackedObservables } from "./observable";

export class ObservableMap<K, V> {
	subscriptions: any[] = [];
	target = this;
	changed = [] as Key[];
	subscribed = false;
	cache = new Map<K, V>();

	constructor(map?: Map<K, V>) {
		this.cache = map || new Map();
	}

	set(key: K, value: V) {
		const previous = this.cache.get(key);
		if (previous === value) return this;
		this.cache.set(key, value);

		this.changed.push(key as Key);
		if (isInAction) actions.add(this);
		else notify(this);

		return this;
	}

	has(key: K) {
		if (effect) {
			this.subscriptions.push({ effect, key });
			trackedObservables.add(this);
		}

		return this.cache.has(key);
	}

	get(key: K) {
		if (effect) {
			this.subscriptions.push({ effect, key });
			trackedObservables.add(this);
		}

		return this.cache.get(key);
	}

	get size() {
		this.subscribe();
		return this.cache.size;
	}

	subscribe() {
		if (!effect) return;
		this.subscriptions.push({ effect });
		trackedObservables.add(this);
		this.subscribed = true;
	}

	values() {
		this.subscribe();
		return this.cache.values();
	}

	entries() {
		this.subscribe();
		return this.cache.entries();
	}

	keys() {
		this.subscribe();
		return this.cache.keys();
	}

	[Symbol.iterator]() {
		this.subscribe();
		return this.cache[Symbol.iterator]();
	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
		this.subscribe();
		return this.cache.forEach(callbackfn, thisArg);
	}

	clear() {
		this.cache.clear();
		if (isInAction) actions.add(this);
		else notify(this);
	}

	delete(key: K) {
		const deleted = this.cache.delete(key);
		if (!deleted) return false;
		this.changed.push(key as Key);
		if (isInAction) actions.add(this);
		else notify(this);
		return true;
	}

	first(): V | undefined {
		return this.values().next().value;
	}

	last(): V | undefined {
		const arr = [...this.values()];
		return arr[arr.length - 1];
	}

	find(fn: (value: V, key: K, collection: this) => unknown): V | undefined {
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}

		return undefined;
	}

	map<T>(fn: (value: V, key: K, collection: this) => T): T[] {
		const iter = this.entries();
		return Array.from({ length: this.cache.size }, (): T => {
			const [key, value] = iter.next().value;
			return fn(value, key, this);
		});
	}

	filter(fn: (value: V, key: K, collection: this) => unknown): V[] {
		const arr = [];
		for (const [key, val] of this) {
			if (fn(val, key, this)) arr.push(val);
		}
		return arr;
	}

	reduce<T>(fn: (accumulator: T, value: V, key: K, collection: this) => T, initialValue: T): T | undefined {
		let accumulator = initialValue;
		for (const [key, val] of this) accumulator = fn(accumulator, val, key, this);
		return accumulator;
	}

	array() {
		return Array.from(this.values());
	}
}
