// 8,184 to 5,072
const fs = require("fs");
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);
const timestamp = require("./timestamp")();
timestamp.begin();

const stringified = fs.readFileSync("output/sectors.json", "utf-8");
const permutationsSectors = JSON.parse(stringified);

const degrees = {
	a: -180,
	b: -90,
	c: 0,
	d: 90,
	e: 180,
};

// this is one half of the intersection test
// if a sector on one side is flat (a), and the other side (b) is
// the same assignment, either 90 or 180, return true
// (the other half is sector angle comparison test)
const assignmentTest = (a, b) => {
	if (a === "a" && (b === "a" || b === "b")) { return true; }
	if (a === "e" && (b === "e" || b === "d")) { return true; }
	return false;
}

// given these creases (o) and size of the angles between them (----)
// --------o----o----
// 1. check if both creases are the same orientation
//    (the first must be 180, the second one can be 90 or 180)
// 2. if the first sector angle is larger than the center, test failed
// repeat on the same intersections approaching from the other direction too
//
const passSectorTest = permutationsSectors
	.map(cp => cp.sectors
		.map((angle, i) => {
			// fencepost:
			// 3 sectors: cp.sectors[prevI], angle, cp.sectors[nextI]
			// 2 creases: cp.creases[i], cp.creases[nextI]
			const prevI = (i + cp.sectors.length - 1) % cp.sectors.length;
			const nextI = (i + 1) % cp.sectors.length;
			if (cp.sectors[prevI] > angle && assignmentTest(cp.creases[i], cp.creases[nextI])) {
				return false;
			}
			if (cp.sectors[nextI] > angle && assignmentTest(cp.creases[nextI], cp.creases[i])) {
				return false;
			}
			return true;
		})
		.reduce((a, b) => a && b, true));

// index-match permutations that fail self-intersection
const failIndices = passSectorTest
	.map((pass, i) => (pass ? undefined : i))
	.filter(a => a !== undefined);

// update valid cps
const valid = fs
	.readFileSync("output/valid.txt", "utf-8")
	.split("\n");
const validMap = {};
valid.forEach(i => { validMap[i] = true; });
failIndices.forEach(i => { delete validMap[i]; })
const newValid = Object.keys(validMap);
fs.writeFileSync(outputDir + "/valid.txt", newValid.join("\n"));

// write logs
const outputSectorTest = passSectorTest
	.map((pass, i) => `${i}: ${pass ? "" : " fail"}`)
	.join("\n");
fs.writeFileSync(outputDir + "/log-sector-intersection-test.txt", outputSectorTest);

const outputSectorFails = failIndices.join("\n");
fs.writeFileSync(outputDir + "/log-sector-intersection-fails.txt", outputSectorFails);
const endTime = timestamp.end("remove sectors that self-intersect");
console.log(`finished in ${endTime[0]} seconds`);
