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

const shiftCycle = (str) => {
	var i = 0;
	for (; i < str.length; i += 1) {
		if (str[i] !== "c") { break; }
	}
	if (i === str.length) { return str; }
	return str.slice(i, str.length) + str.slice(0, i);
}

const cycled = permutations
	// .map(str => str[0] === "c" && str[str.length-1] === "c"
	.map(str => str[0] === "c"
		? shiftCycle(str)
		: str);

// we can count on the first crease line as NOT a flat ("c")
const sectorCreases = cycled
	.map(str => str.split("").filter(char => char !== "c").join(""));
const sectorAngles = cycled.map(str => {
	const angles = [];
	let flat = false;
	let angle = 45;
	for (let i = 1; i < str.length; i += 1) {
		if (str[i] !== "c") {
			angles.push(angle);
			angle = 45;
		} else {
			angle += 45;
		}
	}
	angles.push(angle);
	return angles;
});

// are both creases mountain or valley (including 90deg m/v)
// flat creases return false
const similarAssignment = (a, b) => {
	const aAngle = degrees[a];
	const bAngle = degrees[b];
	if (aAngle < 0 && bAngle < 0) { return true; }
	if (aAngle > 0 && bAngle > 0) { return true; }
	return false;
}

const passSectorTest = sectorAngles.map((angles, arrI) => {
	const creases = sectorCreases[arrI];
	// iterate over all sector angles
	// if one sector fails the test the whole piece is invalid
	const pass = angles.map((angle, i) => {
		const prevI = (i + angles.length - 1) % angles.length;
		const nextI = (i + 1) % angles.length;
		if (angles[prevI] > angle && angles[nextI] > angle) {
			// match the right fencepost
			if (similarAssignment(creases[i], creases[nextI])) {
				return false;
			}
		}
		return true;
	}).reduce((a, b) => a && b, true);
	return pass;
});

let outputSectors = "";
cycled.forEach((str, i) => {
	outputSectors += `${valid[i]}: ${str} (${sectorCreases[i]})\n    ${sectorAngles[i].join(",")}\n`;
});

fs.writeFileSync(outputDir + "/sectors.txt", outputSectors);

let outputSectorTest = "";
passSectorTest.forEach((pass, i) => {
	outputSectorTest += `${valid[i]}: ${pass ? "" : " fail"}\n`;
});

fs.writeFileSync(outputDir + "/smallest-sector-test.txt", outputSectorTest);
