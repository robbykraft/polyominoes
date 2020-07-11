// 8,216 to 8,184
const fs = require("fs");
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);
const timestamp = require("./timestamp")();
timestamp.begin();

const stringified = fs.readFileSync("output/sectors.json", "utf-8");
const permutationsSectors = JSON.parse(stringified);

// both creases are mountain or valley 180 -180. no 90deg fold angles
const flatAndSimilar = (a, b) => {
	if (a === "a" && b === "a") { return true; }
	if (a === "e" && b === "e") { return true; }
	return false;
};

// for every sector angle, if the 2 outer crease are both mountain
// or valley (180, -180), check if either of the two neighbor sector
// angles are larger than this one, proving self-intersection
const selfIntersectionTest = permutationsSectors
	.map(cp => cp.sectors
		.map((angle, i) => {
			// fencepost:
			// 3 sectors: cp.sectors[prevI], angle, cp.sectors[nextI]
			// 2 creases: cp.creases[i], cp.creases[nextI]
			const prevI = (i + cp.sectors.length - 1) % cp.sectors.length;
			const nextI = (i + 1) % cp.sectors.length;
			if (flatAndSimilar(cp.creases[i], cp.creases[nextI])) {
				if (cp.sectors[prevI] > angle && cp.sectors[nextI] > angle) {
					return false;
				}
			}
			return true;
		})
		.reduce((a, b) => a && b, true));

// index-match permutations that fail self-intersection
const failIndices = selfIntersectionTest
	.map((pass, i) => (pass ? undefined : i))
	.filter(a => a !== undefined);

// update valid list, remove invalid cps
const valid = fs
	.readFileSync("output/valid.txt", "utf-8")
	.split("\n");
const validMap = {};
valid.forEach(i => { validMap[i] = true; });
failIndices.forEach(i => { delete validMap[i]; })
const newValid = Object.keys(validMap);
fs.writeFileSync(outputDir + "/valid.txt", newValid.join("\n"));

// write logs
const outputSectorTest = selfIntersectionTest
	.map((pass, i) => `${i}: ${pass ? "" : " fail"}`)
	.join("\n");
fs.writeFileSync(outputDir + "/log-sector-flat-test.txt", outputSectorTest);

const outputSectorFails = failIndices.join("\n");
fs.writeFileSync(outputDir + "/log-sector-flat-fails.txt", outputSectorFails);
const endTime = timestamp.end("remove flat sectors that self-intersect");
console.log(`finished in ${endTime[0]} seconds`);
