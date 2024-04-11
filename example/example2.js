const { autorun, observable } = require("../src");

const o = observable({ a: 1 });
console.time("autorun");

for (let i = 0; i < 1000000; i++) {
	autorun(() => {
		o.subscribe;
		o.a++;
	})();
}

console.timeEnd("autorun");
