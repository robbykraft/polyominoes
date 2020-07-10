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

const valid = fs
	.readFileSync("output/valid.txt", "utf-8")
	.split("\n");
const validMap = {};
valid.forEach(i => { validMap[i] = true; });

const permutations = fs
	.readFileSync("output/permutations.txt", "utf-8")
	.split("\n")
	.filter((_, i) => validMap[i]);


// const permutations = fs
// 	.readFileSync("output/permutations_valid.txt", "utf-8")
// 	.split("\n");

// const valid = fs
// 	.readFileSync("output/isIdentity.txt", "utf-8")
// 	.split("\n")
// 	.map((e, i) => e.includes("true") ? i : null)
// 	.filter(a => a !== null);

const flatFoldsOnly = permutations
	.map(str => !str.includes("b") && !str.includes("d"));

const flatIndices = [];

// let outputFlatFoldsOnly = "";
const flatFoldable = flatFoldsOnly.map((ff, i) => ({ff, i}))
	.filter(el => el.ff)
	.map(el => valid[el.i]);
const outputFlatFoldsOnly = flatFoldable.join("\n");
// flatFoldsOnly.forEach((ff, i) => {
// 	if (ff) { flatIndices.push(i); }
// 	outputFlatFoldsOnly += `${valid[i]}:${(ff ? " true" : "")}\n`
// });

const maekawaTest = flatIndices
	.map((i) => permutations[i].split("")
		.map(l => degrees[l])
		.reduce((a, b) => a + b, 0));

let outputMaekawaSum = "";
maekawaTest.forEach((sum, i) => {
	outputMaekawaSum += `${valid[flatIndices[i]]}: ${(sum)}\n`
});

const maekawaPassedTest = maekawaTest
	.map(sum => sum === 360 || sum === -360);

let outputMaekawaPassed = "";
maekawaPassedTest.forEach((pass, i) => {
	outputMaekawaPassed += `${valid[flatIndices[i]]}:${(pass ? "" : " fail")}\n`
});

fs.writeFileSync(outputDir + "/log-flat-foldable.txt", outputFlatFoldsOnly);
fs.writeFileSync(outputDir + "/log-flatFoldsMaekawaSums.txt", outputMaekawaSum);
fs.writeFileSync(outputDir + "/log-flatFoldsMaekawaPass.txt", outputMaekawaPassed);
// fs.writeFileSync(outputDir + "/windings_valid.txt", outputValid);

// remove svgs from folder that aren't valid
// maekawaPassedTest.forEach((pass, i) => {
// 	if (!pass) {
// 		fs.unlinkSync(`${outputDir}/svgs/${valid[flatIndices[i]]}.svg`);
// 	}
// });

// console.log(windings.length, permutations.length);

timestamp.end("maekawa's theorem applied to flat-foldable");
