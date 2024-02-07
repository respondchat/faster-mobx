export function isSame(obj: any, other: any): boolean {
	if (obj === other) return true;
	if (obj === null || other === null) return false;
	if (typeof obj !== "object" || typeof other !== "object") return false;
	if (Array.isArray(obj)) {
		if (!Array.isArray(other)) return false;
		return obj.length === other.length
	}
	if (obj instanceof Date) {
		if (!(other instanceof Date)) return false;
		return obj.getTime() === other.getTime();
	}
	if (obj instanceof Map) {
		if (!(other instanceof Map)) return false;
		return obj.size === other.size
	}
	if (obj instanceof Set) {
		if (!(other instanceof Set)) return false;
		return obj.size === other.size
	}
	return Object.keys(obj).length === Object.keys(other).length
}


export function isSameDeep(obj: any, other: any, depth = 0): boolean {
	if (obj === other) return true;
	if (depth > 5) return false;
	if (obj === null || other === null) return false;
	if (typeof obj !== "object" || typeof other !== "object") return false;
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
			if (!other.has(key)) return false;
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
