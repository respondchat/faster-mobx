import { expect, test } from "bun:test";
import { ObservableMap, reaction } from "../src/index";

test("map 1x", () => {
	const x = new ObservableMap();

	reaction(
		() => x.array(),
		(value) => {
			expect(true).toBe(true);
		}
	);

	x.set("a", 1);
}, 10);

test("map 100x", () => {
	const x = new ObservableMap();

	for (let i = 0; i < 100; i++) {
		const cleanup = reaction(
			() => x.array(),
			(value) => {
				cleanup();
				console.log(value);
				expect(true).toBe(true);
			}
		);
	}

	for (let i = 0; i < 100; i++) {
		x.set("a", i);
	}
}, 10);
