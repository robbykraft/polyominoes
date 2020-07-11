const fs = require("fs");
const timestamp = require("./timestamp")();
timestamp.begin();
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

const degrees = {
	a: -180,
	b: -90,
	c: 0,
	d: 90,
	e: 180,
};

// permutations is the array of indices. minus the invalid ones.
const permutations = fs
	.readFileSync("output/permutations.txt", "utf-8")
	.split("\n")
	// .filter((_, i) => validMap[i]);

const flatFoldsOnly = permutations
	.map(str => !str.includes("b") && !str.includes("d"));

const flatIndices = [];

// array of indices
const flatFoldable = flatFoldsOnly
	.map((ff, i) => ({ff, i}))
	.filter(el => el.ff)
	.map(el => el.i);

// index-matches with flatFoldable
const maekawaTest = flatFoldable
	.map((i) => permutations[i].split("")
		.map(l => degrees[l])
		.reduce((a, b) => a + b, 0));

let outputMaekawaSum = "";
maekawaTest.forEach((sum, i) => {
	outputMaekawaSum += `${flatFoldable[i]}: ${(sum)}\n`
});

const maekawaPassedTest = maekawaTest
	.map(sum => sum === 360 || sum === -360);

// the final list of failures. indices. cps that fail Maekawa's theorem
const failIndices = maekawaPassedTest
	.map((pass, i) => (pass ? undefined : flatFoldable[i]))
	.filter(a => a !== undefined);

// update valid list, remove invalid Maekawa flat foldable CPs
const valid = fs
	.readFileSync("output/valid.txt", "utf-8")
	.split("\n");
const validMap = {};
valid.forEach(i => { validMap[i] = true; });
failIndices.forEach(i => { delete validMap[i]; })
const newValid = Object.keys(validMap);
fs.writeFileSync(outputDir + "/valid.txt", newValid.join("\n"));

// write logs
const outputFlatFoldsOnly = flatFoldable.join("\n");
fs.writeFileSync(outputDir + "/log-flat-foldable.txt", outputFlatFoldsOnly);
const outputFailIndices = failIndices.join("\n");
fs.writeFileSync(outputDir + "/log-Maekawa-fails.txt", outputFailIndices);
fs.writeFileSync(outputDir + "/log-flatFoldsMaekawaSums.txt", outputMaekawaSum);
const endTime = timestamp.end("maekawa's theorem applied to flat-foldable");
console.log(`finished in ${endTime[0]} seconds`);
