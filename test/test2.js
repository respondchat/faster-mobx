const { autorun, observable } = require("../");

const o = observable({ a: 1 });

for (let i = 0; i < 1000000; i++) {
	autorun(() => {
		o.subscribe;
	})();
}

console.log("done");
