const fs = require("fs");
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

const degrees = {
	a: -180,
	b: -90,
	c: 0,
	d: 90,
	e: 180,
};

const permutations = fs
	.readFileSync("output/permutations_valid.txt", "utf-8")
	.split("\n");

const valid = fs
	.readFileSync("output/isIdentity.txt", "utf-8")
	.split("\n")
	.map((e, i) => e.includes("true") ? i : null)
	.filter(a => a !== null);

const flatFoldsOnly = permutations
	.map(str => !str.includes("b") && !str.includes("d"));

const flatIndices = [];

let outputFlatFoldsOnly = "";
flatFoldsOnly.forEach((ff, i) => {
	if (ff) { flatIndices.push(i); }
	outputFlatFoldsOnly += `${valid[i]}:${(ff ? " true" : "")}\n`
});

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

fs.writeFileSync(outputDir + "/flatFoldsOnly.txt", outputFlatFoldsOnly);
fs.writeFileSync(outputDir + "/flatFoldsMaekawaSums.txt", outputMaekawaSum);
fs.writeFileSync(outputDir + "/flatFoldsMaekawaPass.txt", outputMaekawaPassed);
// fs.writeFileSync(outputDir + "/windings_valid.txt", outputValid);

// remove svgs from folder that aren't valid
maekawaPassedTest.forEach((pass, i) => {
	if (!pass) {
		fs.unlinkSync(`${outputDir}/svgs/${valid[flatIndices[i]]}.svg`);
	}
});

// console.log(windings.length, permutations.length);
