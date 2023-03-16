import * as mobx from "mobx";
import benchmark from "benchmark";
import { autorun, observable } from "../src/observable";

const suite = new benchmark.Suite();

const benchmarkMobx = false;
if (benchmarkMobx) {
	class MobX1 {
		@mobx.observable
		a = 1;

		constructor() {
			mobx.makeObservable(this);
		}
	}

	class MobX26 {
		@mobx.observable
		a = 1;

		@mobx.observable
		b = 1;

		@mobx.observable
		c = 1;

		@mobx.observable
		d = 1;

		@mobx.observable
		e = 1;

		@mobx.observable
		f = 1;

		@mobx.observable
		g = 1;

		@mobx.observable
		h = 1;

		@mobx.observable
		i = 1;

		@mobx.observable
		j = 1;

		@mobx.observable
		k = 1;

		@mobx.observable
		l = 1;

		@mobx.observable
		m = 1;

		@mobx.observable
		n = 1;

		@mobx.observable
		o = 1;

		@mobx.observable
		p = 1;

		@mobx.observable
		q = 1;

		@mobx.observable
		r = 1;

		@mobx.observable
		s = 1;

		@mobx.observable
		t = 1;

		@mobx.observable
		u = 1;

		@mobx.observable
		v = 1;

		@mobx.observable
		w = 1;

		@mobx.observable
		x = 1;

		@mobx.observable
		y = 1;

		@mobx.observable
		z = 1;

		constructor() {
			mobx.makeObservable(this);
		}
	}

	const a = mobx.observable({ a: 1 });

	autorun(() => a.a);

	suite
		.add("MobX - observable", function () {
			return mobx.observable({ a: 1 });
		})
		.add("MobX - makeObservable (1 property)", function () {
			return new MobX1();
		})
		.add("MobX - makeObservable (26 properties)", function () {
			return new MobX26();
		})
		.add("MobX - autorun", () => {
			autorun(() => a.a)();
		})
		.add("MobX - get", function () {
			a.a;
		})
		.add("MobX - set", function () {
			a.a = 2;
		});
}

const x = observable({ a: 1 });
let i = 0;

class ObservableClass1 {
	x = 1;

	constructor() {
		return observable(this);
	}
}

class ObservableClass26 {
	a = 1;
	b = 1;
	c = 1;
	d = 1;
	e = 1;
	f = 1;
	g = 1;
	h = 1;
	i = 1;
	j = 1;
	k = 1;
	l = 1;
	m = 1;
	n = 1;
	o = 1;
	p = 1;
	q = 1;
	r = 1;
	s = 1;
	t = 1;
	u = 1;
	v = 1;
	w = 1;
	x = 1;
	y = 1;
	z = 1;

	constructor() {
		return observable(this);
	}
}

autorun(() => x.a);
const test = {
	a: undefined,
};

suite
	.add("test", function () {
		test["a"] = test["a"];
	})
	.add("test2", function () {
		Object.hasOwn(test, "a");
	})
	.add("test3", function () {
		test.hasOwnProperty("a");
	})
	.add("Faster observable", function () {
		return observable({});
	})
	.add("Faster makeObservable (1 property)", function () {
		new ObservableClass1();
	})
	.add("Faster makeObservable (26 properties)", function () {
		new ObservableClass1();
	})
	.add("Faster autorun", () => {
		autorun(() => x.a)();
	})
	.add("Faster get", function () {
		x.a;
	})
	.add("Faster set", function () {
		x.a = i;
	});

suite
	.on("cycle", function (event: any) {
		console.log(String(event.target));
	})
	.run({ async: false });
