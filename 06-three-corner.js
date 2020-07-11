// 5,072 to 4,580

// test if there are two 90 degree creases neighboring a 180.
// consecutive: 90, 180, 90 (M or V. but must be same assignment)
// it doesn't matter the sector angle between them. it's invalid.
const fs = require("fs");
const timestamp = require("./timestamp")();
timestamp.begin();
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

const permutations = fs
	.readFileSync("output/permutations.txt", "utf-8")
	.split("\n");

// remove flat creases
const creases = permutations
	.map(str => str
		.split("")
		.filter(c => c !== "c")
		.join(""));

// cycle each string at its halfway point. to check across the 0-360 line
const halfCycledCreases = creases
	.map(str => (str.length < 2
		? str
		: str.slice(Math.floor(str.length/2), str.length) + str.slice(0, Math.floor(str.length/2))));

const fail3CornerTest = creases
	.map((str, i) => str.includes("bab")
		|| str.includes("ded")
		|| halfCycledCreases[i].includes("bab")
		|| halfCycledCreases[i].includes("ded"));

const failIndices = fail3CornerTest
	.map((fail, i) => (fail ? i : undefined))
	.filter(a => a !== undefined);

// update valid list
const valid = fs
	.readFileSync("output/valid.txt", "utf-8")
	.split("\n");
const validMap = {};
valid.forEach(i => { validMap[i] = true; });
failIndices.forEach(i => { delete validMap[i]; })
const newValid = Object.keys(validMap);
fs.writeFileSync(outputDir + "/valid.txt", newValid.join("\n"));

// write logs
const outputFailIndices = failIndices.join("\n");
fs.writeFileSync(outputDir + "/log-3-corner-fails.txt", outputFailIndices);
const endTime = timestamp.end("3-corner-test");
console.log(`finished in ${endTime[0]}.${endTime[1]} seconds`);
