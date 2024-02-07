import { effect, isInAction, Key, changed, Effect, InternalObservable, subscribeKey, subscribed } from "./observable";
import { isSame } from "./util";

export class ObservableMap<K extends Key, V> {
	cache = new Map<K, V>();
	effects = [] as Effect[];

	constructor(map?: Map<K, V>) {
		this.cache = map || new Map();
	}

	has(key: K) {
		this.subscribe;

		return this.cache.has(key);
	}

	get(key: K) {
		this.subscribe;

		return this.cache.get(key);
	}

	set(key: K, value: V) {
		const previous = this.cache.get(key);
		if (previous === value) return this;
		if (isSame(previous, value)) return this;
		this.cache.set(key, value);

		this.effects.forEach((effect) => {
			changed.set(effect, { target: this, effects: this.effects });
			if (!isInAction) effect(this);
		});

		return this;
	}

	get size() {
		this.subscribe;
		return this.cache.size;
	}

	get subscribe() {
		if (!effect || subscribed.has(effect)) return;

		this.effects.push(effect);
		subscribed.set(effect, this);
	}

	values() {
		this.subscribe;
		return this.cache.values();
	}

	entries() {
		this.subscribe;
		return this.cache.entries();
	}

	keys() {
		this.subscribe;
		return this.cache.keys();
	}

	[Symbol.iterator]() {
		this.subscribe;
		return this.cache[Symbol.iterator]();
	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
		this.subscribe;
		return this.cache.forEach(callbackfn, thisArg);
	}

	clear() {
		this.cache.clear();

		this.subscribe;
	}

	delete(key: K) {
		const deleted = this.cache.delete(key);
		if (!deleted) return false;

		this.subscribe;

		return true;
	}

	first(): V | undefined {
		return this.values().next().value;
	}

	last(): V | undefined {
		let lastValue;
		for (const value of this.values()) {
			lastValue = value;
		}
		return lastValue;
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

	reduce<T>(fn: (accumulator: T, value: V, key: K, collection: this) => T, initialValue: T): T {
		let accumulator = initialValue;
		for (const [key, val] of this) accumulator = fn(accumulator, val, key, this);
		return accumulator;
	}

	array() {
		return Array.from(this.values());
	}
}
