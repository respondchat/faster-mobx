import { ObservableMap } from "./map";
import { autorun, makeObservable, observable } from "./observable";

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
	console.log(test.x, test.y);
});

test.x = 2;
test.y = 3;

const map = new ObservableMap();

autorun(() => {
	map.get("a");
	console.log("a changed");
});

map.set("a", 1);
map.set("b", 2);
