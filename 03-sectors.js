// this file simply generates the sector-angle information
// for every permutation
// does not test or validate or invalidate anything.
const fs = require("fs");
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);
const timestamp = require("./timestamp")();
timestamp.begin();

const permutations = fs
	.readFileSync("output/permutations.txt", "utf-8")
	.split("\n");

// cycle any "c" to the end of the string "ccbabacc" => "babacccc".
// rotationally similar. preserve the order.
// this works even with the string "cccccccc"
const shiftCycle = (str) => {
	var i = 0;
	for (; i < str.length; i += 1) {
		if (str[i] !== "c") { break; }
	}
	return str.slice(i, str.length) + str.slice(0, i);
}

// make it so that no sector straddles the 0-360 line.
// rotate the creases around if so.
const cycled = permutations
	// .map(str => str[0] === "c" && str[str.length-1] === "c"
	.map(str => (str[0] === "c"
		? shiftCycle(str)
		: str));

// build a fencepost for each CP of sector creases and angles.
// index-match with permutations, each inner array is no longer
// 8-long, because we filter out the flat creases.
//
// example entry:
// sectorCreases: "aedb"
// sectorAngles: [180, 90, 45, 45]
// in this example, 180 sector is BETWEEN creases "a" and "e"

// only the non-flat creases for each CP.
const sectorCreases = cycled
	.map(str => str
		.split("")
		.filter(char => char !== "c")
		.join(""));

// walk around the CP. discover sector angles by incrementing 45deg
// each time, until we hit a crease
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

const sectors = sectorCreases
	.map((creases, i) => ({ creases, sectors: sectorAngles[i] }))
fs.writeFileSync(outputDir + "/sectors.json", JSON.stringify(sectors, null, " "));
const endTime = timestamp.end("converted permutations to sector-angle form");
console.log(`finished in ${endTime[0]} seconds`);
