// import { autorun, observable, runInAction } from "./observable";
import * as mobx from "mobx";
import * as mobx2 from "mobx/dist/types/dynamicobject";

mobx.configure({ enforceActions: "never" });

export class MobxObservableClass {
	a = 1;
	b = 1;

	constructor() {
		mobx.makeObservable(this, {
			a: mobx.observable,
			b: mobx.observable,
		});
	}
}

const test = new MobxObservableClass();
console.log("test", test);

function testObservable(x: any) {
	const dispose = mobx.reaction(
		() => {
			console.log("reaction", { a: x.a, b: x.b });
			return x.a;
		},
		() => {
			console.log("value", { a: x.a, b: x.b });
		}
	);

	x.a++;
	x.b++;

	mobx.runInAction(() => {
		x.a *= 2;
		x.b *= 2;
	});

	dispose();
}

testObservable(test);
// testObservable(variable);
