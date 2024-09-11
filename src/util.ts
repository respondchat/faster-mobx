export function isSame(obj: any, other: any): boolean {
	if (obj === other) return true;
	if (typeof obj !== typeof other) return false;
	if (typeof obj !== "object" || typeof other !== "object") return false;
	if (obj === null || other === null) return false;
	if (obj instanceof Date) {
		if (!(other instanceof Date)) return false;
		return obj.getTime() === other.getTime();
	}
	if (Array.isArray(obj)) {
		if (!Array.isArray(other)) return false;
		if (obj.length !== other.length) return false;
		return obj.every((x, i) => isSame(x, other[i]));
	}
	if (obj instanceof Map) {
		if (!(other instanceof Map)) return false;
		if (obj.size !== other.size) return false;
		if (obj.size > 100) return false;

		for (const [key, value] of obj) {
			const val = other.get(key);
			if (!isSame(value, val)) return false;
		}
		return true;
	}
	if (obj instanceof Set) {
		if (!(other instanceof Set)) return false;
		if (obj.size !== other.size) return false;
		if (obj.size > 100) return false;

		for (const value of obj) {
			if (!other.has(value)) return false;
		}

		return true;
	}
	// no deep comparison for objects, because observable objects are shallow
	return Object.entries(obj).every(([key, value]) => value == other[key]);
}

export function isSameDeep(obj: any, other: any, depth = 0): boolean {
	if (obj === other) return true;
	if (depth > 5) return false;
	if (typeof obj !== typeof other) return false;
	if (typeof obj !== "object" || typeof other !== "object") return false;
	if (obj === null || other === null) return false;
	if (Array.isArray(obj)) {
		if (!Array.isArray(other)) return false;
		if (obj.length !== other.length) return false;
		return obj.every((x, i) => isSameDeep(x, other[i], depth + 1));
	}
	if (obj instanceof Date) {
		if (!(other instanceof Date)) return false;
		return obj.getTime() === other.getTime();
	}
	if (obj instanceof Map) {
		if (!(other instanceof Map)) return false;
		if (obj.size !== other.size) return false;
		for (const [key, value] of obj) {
			if (!isSameDeep(value, other.get(key), depth + 1)) return false;
		}
		return true;
	}
	if (obj instanceof Set) {
		if (!(other instanceof Set)) return false;
		if (obj.size !== other.size) return false;
		for (const value of obj) {
			if (!other.has(value)) return false;
		}
		return true;
	}
	const keys = Object.keys(obj);
	if (keys.length !== Object.keys(other).length) return false;
	return keys.every((key) => isSameDeep(obj[key], other[key], depth + 1));
}

let timeouts = [] as (Function & { end: number })[];

export function batchedTimeout(fn: Function, time = 0) {
	const callback = fn as Function & { end: number };
	callback.end = Date.now() + time;
	timeouts.push(callback);
}

setInterval(() => {
	if (timeouts.length) {
		const now = Date.now();
		timeouts = timeouts.filter((x) => {
			if (now < x.end) return true;
			x();
			return false;
		});
	}
}, 100);
