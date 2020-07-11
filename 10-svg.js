// whenever you are ready, build the SVGs using the list of
// indices contained in "output/valid.txt"

const fs = require("fs");
const SVG = require("rabbit-ear-svg");
const timestamp = require("./timestamp")();
timestamp.begin();
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

const SIZE = 20;

const creaseCoords = [
	[0, 0, SIZE, 0],
	[0, 0, SIZE, SIZE],
	[0, 0, 0, SIZE],
	[0, 0, -SIZE, SIZE],
	[0, 0, -SIZE, 0],
	[0, 0, -SIZE, -SIZE],
	[0, 0, 0, -SIZE],
	[0, 0, SIZE, -SIZE],
];

const foldAngleStrokes = {
	a: "#00f", // "#00ff",
	b: "#00f", // "#00f8",
	c: "#fff", // "#fff0",
	d: "#f00", // "#f008",
	e: "#f00", // "#f00f",
};
const foldAngleOpacities = {
	a: "1.0",
	b: "0.5",
	c: "1.0",
	d: "0.5",
	e: "1.0",
};

const drawPermutation = (perm) => {
	const svg = SVG(-SIZE, -SIZE, SIZE * 2, SIZE * 2);
	Array.from(perm).map((letter, i) => {
		if (letter !== "c") {
			svg.line(...creaseCoords[i])
				.stroke(foldAngleStrokes[letter])
				.opacity(foldAngleOpacities[letter]);
		}
	});
	svg.rect(-SIZE, -SIZE, SIZE*2, SIZE*2)
		.fill("none")
		.stroke("#000");
	return svg.save();
}

const svgDir = outputDir + "/svgs";
fs.existsSync(svgDir) || fs.mkdirSync(svgDir);

const valid = fs
	.readFileSync("output/valid.txt", "utf-8")
	.split("\n");
const validMap = {};
valid.forEach(i => { validMap[i] = true; });

const validPermutations = fs
	.readFileSync("output/permutations.txt", "utf-8")
	.split("\n")
	.filter((_, i) => validMap[i]);

validPermutations.forEach((perm, i) => {
	const svg = drawPermutation(perm);
	fs.writeFileSync(`${svgDir}/${valid[i]}.svg`, svg);
});

const endTime = timestamp.end(`wrote ${validPermutations.length} svgs`);
console.log(`finished in ${endTime[0]} seconds`);
