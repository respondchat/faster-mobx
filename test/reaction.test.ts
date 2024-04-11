import { expect, test } from "bun:test";
import { ObservableMap, observable, reaction, runInAction } from "../src/index";
import { sleep } from "bun";

test("reaction cleans up properly", () => {
	const x = observable({
		test: 1,
	});

	let called = 0;

	reaction(
		() => x.test,
		(value) => {
			called++;
		}
	);

	let cleanups = [] as any[];
	for (let i = 0; i < 100; i++) {
		const cleanup = reaction(
			() => x.test,
			(value) => {
				called++;
			}
		);
		cleanups.push(cleanup);
	}

	x.test++;

	expect(called).toBe(101);

	cleanups.forEach((cleanup) => cleanup());

	x.test++;

	expect(called).toBe(102);
});

test("reaction cleans up properly in runInAction", async () => {
	const x = observable({
		test: 1,
	});

	let called = 0;

	reaction(
		() => x.test,
		(value) => {
			called++;
		}
	);

	let cleanups = [] as any[];
	for (let i = 0; i < 100; i++) {
		const cleanup = reaction(
			() => x.test,
			(value) => {
				called++;
			}
		);
		cleanups.push(cleanup);
	}

	runInAction(() => {
		x.test++;
	});

	await sleep(10);

	expect(called).toBe(101);

	cleanups.forEach((cleanup) => cleanup());

	runInAction(() => {
		x.test++;
	});

	await sleep(10);

	expect(called).toBe(102);
});
