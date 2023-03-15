# Faster Mobx

MobX is a state management library designed to notify observers of changes to an observable object's state.

However, the `observable` function of MobX has performance issues when handling large amounts of objects with many properties.

To address this issue, the `faster-mobx` library has been developed, providing a **50-500x faster** `observable` implementation of MobX that can be used as a drop in replacement.

## Features

-   [x] `observable`
-   [x] `makeObservable`
-   [x] `autorun`
-   [x] `reaction`
-   [x] `runInAction` (with async support)
-   [x] `observer` (React support)
-   [ ] `observable.map`
-   [ ] `computed`
-   [ ] `action`
-   [ ] `configure`
-   [ ] `extendObservable`
-   [ ] `toJS`
-   [ ] `trace`

## Installation

```
# with npm
npm i faster-mobx

# with yarn
yarn add faster-mobx

# with pnpm
pnpm add faster-mobx
```

## Usage

```js
import { observable, autorun, makeObservable } from "faster-mobx";

const data = observable({
	name: "John",
	age: 20,
});

autorun(() => {
	console.log(data.name);
});

data.name = "Jane";

// with classes

class User {
	name = "John";
	age = 20;

	constructor() {
		// all properties will be observable
		// if you extend this class, you MUST NOT call makeObservable again in the child class
		// the return is important to make it reactive
		return makeObservable(this);
	}
}
```

## Benchmark

Benchmark was done using [benchmark.js](https://benchmarkjs.com/) on a 20x Core CPU @ 3.20GHz.

| Function                       |     Mobx     | Faster Mobx | Speedup |
| ------------------------------ | :----------: | :---------: | :-----: |
| observable                     | 570k ops/sec | 32M ops/sec |   56x   |
| makeObservable (1 property)    | 750k ops/sec | 37M ops/sec |   50x   |
| makeObservable (26 properties) | 54k ops/sec  | 30M ops/sec |  555x   |
| autorun                        | 12M ops/sec  | 11M ops/sec |  0.9x   |
| get                            | 23M ops/sec  | 54M ops/sec |  2.3x   |
| set                            | 19M ops/sec  | 53M ops/sec |  2.8x   |

You can run the benchmark yourself by cloning the repo and running the following commands:

```bash
git clone https://github.com/trantlabs/faster-mobx
cd faster-mobx
npm install
npm run benchmark
```
