import { actions, effect, isInAction, Key, notify, trackedObservables } from "./observable";

export class ObservableMap<K, V> extends Map<K, V> {
	subscriptions: any[] = [];
	target = this;
	changed = {} as Record<Key, any>;

	override set(key: K, value: V) {
		const previous = super.get(key);
		if (previous === value) return this;
		super.set(key, value);

		this.changed[key as Key] = value;
		if (isInAction) actions.add(this);
		else notify(this);

		return this;
	}

	override has(key: K) {
		if (effect) {
			this.subscriptions.push({ effect, key });
			trackedObservables.add(this);
		}

		return super.has(key);
	}

	override get(key: K) {
		if (effect) {
			this.subscriptions.push({ effect, key });
			trackedObservables.add(this);
		}

		return super.get(key);
	}

	override get size() {
		this.subscribe();
		return super.size;
	}

	subscribe() {
		if (!effect) return;
		this.subscriptions.push({ effect });
		trackedObservables.add(this);
	}

	override values() {
		this.subscribe();
		return super.values();
	}

	override entries() {
		this.subscribe();
		return super.entries();
	}

	override keys() {
		this.subscribe();
		return super.keys();
	}

	override [Symbol.iterator]() {
		this.subscribe();
		return super[Symbol.iterator]();
	}

	override forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
		this.subscribe();
		return super.forEach(callbackfn, thisArg);
	}

	override clear() {
		super.clear();
		if (isInAction) actions.add(this);
		else notify(this);
	}

	override delete(key: K) {
		const deleted = super.delete(key);
		if (!deleted) return false;
		this.changed[key as Key] = null;
		if (isInAction) actions.add(this);
		else notify(this);
		return true;
	}
}
