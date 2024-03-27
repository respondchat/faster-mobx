import { expect, test } from "bun:test";
import { observable, reaction } from "../src/index";

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
