import { effect, Key, subscribeKey, subscribed, triggerValueSet, Effects } from "./observable";
import { isSame } from "./util";

export class MapObject<K extends string | symbol, V> {
	[key: string | symbol]: any;
	cache = {} as any;
	size = 0;

	get value() {
		return this.cache;
	}

	get(key: K) {
		return this.cache[key];
	}

	set(key: K, value: any) {
		this.cache[key] = value;
		this.size++;
		return this;
	}

	has(key: K) {
		return key in this.cache;
	}

	clear() {
		for (const key in this) {
			delete this.cache[key];
		}
		this.size = 0;
	}

	delete(key: K) {
		if (key in this.cache) {
			delete this.cache[key];
			this.size--;
			return true;
		}
		return false;
	}

	values() {
		return Object.values(this.cache)[Symbol.iterator]() as IterableIterator<V>;
	}

	entries() {
		return Object.entries(this.cache)[Symbol.iterator]() as IterableIterator<[K, V]>;
	}

	keys() {
		return Object.keys(this.cache)[Symbol.iterator]() as IterableIterator<K>;
	}

	[Symbol.iterator]() {
		return Object.entries(this.cache)[Symbol.iterator]() as IterableIterator<[K, V]>;
	}

	[Symbol.toStringTag] = "Map";

	forEach(callbackfn: (value: V, key: K, map: MapObject<K, V>) => void, thisArg?: any) {
		for (const key in this.cache) {
			callbackfn(this.cache[key], key as K, this);
		}
	}
}

export class ObservableMap<K extends Key, V> {
	cache: Map<K, V>;
	effects = new Map() as Effects;

	constructor(map?: Map<K, V>, useObject = false) {
		this.cache = map && map instanceof Map ? map : useObject ? (new MapObject() as any) : new Map(map);
	}

	get value() {
		return this.cache;
	}

	has(key: K) {
		this.doSubscribe(key);

		return this.cache.has(key);
	}

	get(key: K) {
		this.doSubscribe(key);

		return this.cache.get(key);
	}

	set(key: K, value: V) {
		const previous = this.cache.get(key);
		this.cache.set(key, value);
		if (isSame(previous, value)) return this;

		triggerValueSet(this.effects, this.cache, key, value, previous);

		return this;
	}

	get size() {
		this.doSubscribe(subscribeKey);
		return this.cache.size;
	}

	get subscribe() {
		return this.doSubscribe(subscribeKey);
	}

	doSubscribe(key: any) {
		if (!effect) return this;

		var set = this.effects.get(key);
		if (!set) this.effects.set(key, (set = new Set()));
		set.add(effect);

		subscribed.get(effect)!.add(this.effects);
		return this;
	}

	values() {
		this.doSubscribe(subscribeKey);
		return this.cache.values();
	}

	entries() {
		this.doSubscribe(subscribeKey);
		return this.cache.entries();
	}

	keys() {
		this.doSubscribe(subscribeKey);
		return this.cache.keys();
	}

	[Symbol.iterator]() {
		this.doSubscribe(subscribeKey);
		return this.cache[Symbol.iterator]();
	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
		this.doSubscribe(subscribeKey);
		return this.cache.forEach(callbackfn, thisArg);
	}

	clear() {
		this.cache.clear();

		this.doSubscribe(subscribeKey);
	}

	delete(key: K) {
		const deleted = this.cache.delete(key);
		if (!deleted) return false;

		triggerValueSet(this.effects, this.cache, key, true, "map.delete()");

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
			const result = iter.next().value;
			if (!result) return undefined as any;
			return fn(result[1], result[0], this);
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
