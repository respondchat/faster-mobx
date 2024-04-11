import { expect, test } from "bun:test";
import { ObservableMap, observable, reaction } from "../src/index";

test("observable", () => {
	const x = observable({
		value: 1,
	});

	reaction(
		() => x.subscribe,
		(value) => {
			expect(true).toBe(true);
		}
	);

	x.value = 2;
}, 10);

test("observable object and map", () => {
	const x = observable({
		value: 1,
	});

	const map = new ObservableMap();

	reaction(
		() => {
			x.subscribe;
			map.subscribe;
			map.get("test");
		},
		(value) => {
			console.log("reaction", value);
			expect(true).toBe(true);
		}
	);

	x.value = 2;
	map.set("key", "value");
	x.value = 3;
}, 10);

test("reaction 100x", async () => {
	const x = observable({
		value: 1,
	});
	const length = 100;
	let count = 0;

	const promise = Promise.all(
		Array.from(
			{ length },
			(_, i) =>
				new Promise((resolve) => {
					reaction(
						() => x.subscribe,
						(value) => {
							count++;
							resolve(null);
						}
					);
				})
		)
	);

	x.value = 2;

	await promise;
	expect(count).toBe(length);
}, 10);
