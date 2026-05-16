export async function startWasm() {
	// Assumes /wasm/blazor.boot.json and dotnet.js are in public/wasm
	const res = await fetch('/wasm/blazor.boot.json');
	const boot = await res.json();
	// Start the .NET runtime
	await (window.DotNet?.run ? window.DotNet.run(boot) : DotNet.run(boot));
}
