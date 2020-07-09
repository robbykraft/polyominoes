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

const fixCycle = (str) => {
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
		? fixCycle(str)
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

// const flatFoldsOnly = permutations
// 	.map(str => !str.includes("b") && !str.includes("d"));

// const flatIndices = [];

let otuputSectors = "";
cycled.forEach((str, i) => {
	otuputSectors += `${valid[i]}: ${str} (${sectorCreases[i]})\n    ${sectorAngles[i].join(",")}\n`;
});

fs.writeFileSync(outputDir + "/sectors.txt", otuputSectors);
