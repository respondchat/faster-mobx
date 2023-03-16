import { observable, observer } from "../../src/";

const state = observable({
	count: 0,
});

function App() {
	return (
		<div className="App">
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => state.count++}>count is {state.count}</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</div>
	);
}

export default observer(App);
