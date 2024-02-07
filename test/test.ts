import { ObservableMap } from "../src/map";
import { autorun, makeObservable, observable } from "../src/observable";

class Test {
	x = 1;

	constructor() {
		return makeObservable(this);
	}
}

class SubTest extends Test {
	y = 1;
}

const test = new SubTest();

autorun(() => {
	console.log({
		...test,
	});
});

test.x = 2;
test.y = 3;

const map = new ObservableMap();

autorun(() => {
	console.log("map a changed", map.get("a"));
});

autorun(() => {
	map.subscribe;
	console.log("map changed", map.entries());
});

map.set("a", 1);
map.set("b", 2);

const obj = observable({
	a: 1,
	b: 2,
});

autorun(() => {
	obj.a;
	obj.b;
	console.log("obj changed", obj);
});

obj.a = 2;
obj.b = 3;
