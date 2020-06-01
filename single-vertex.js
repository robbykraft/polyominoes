const fs = require("fs")
const SVG = require("rabbit-ear-svg");
const math = require("./math")

// from calculations in this code, we have found:
// 390,625 possible permutations of one crease pattern with:
//  - 8 fold lines
//  - each fold line is 1 of 5 fold angles: -180, -90, 0, 90, 180

// possible ps:
// -180, -90, 0, 90, 180
const fold_angles = [-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI];

// the dihedral fold angle.
const p_matrices = fold_angles
	.map(angle => math.matrix().rotateX(angle));
const p_matrices_dictionary = {
	a: p_matrices[0],
	b: p_matrices[1],
	c: p_matrices[2],
	d: p_matrices[3],
	e: p_matrices[4],
}
// rotate 1/8 45deg crease lines into place along the X axis
const a_matrices = Array.from(Array(8))
	.map((_, i) => i/8*Math.PI*2)
	.map(angle => math.matrix().rotateZ(angle));

// make a special case. all flat.
const blankEntry = () => Array
	.from(Array(8))
	.map((_, i) => ({a: i * Math.PI/4, p: 0}))

const recurse = (string, permutations = []) => {
	if (string.length >= 8) {
		permutations.push(string);
		return permutations;
	}
	return recurse(string + "a")
		.concat(recurse(string + "b"))
		.concat(recurse(string + "c"))
		.concat(recurse(string + "d"))
		.concat(recurse(string + "e"));
}

// recurse, find all permutations, valid and invalid.
const permutations = recurse("");


const permString = permutations.join("\n");
fs.writeFileSync("permutations.txt", permString);


///////////////////////////////////////////
//
//  CLIP DATA
//  to speed up program. smaller data set.

permutations.splice(1000);

// permutations.unshift("dcdcdcea");
// permutations.unshift("cccccccc");
// console.log(permutations);

//
///////////////////////////////////////////

const creasePatterns = permutations.map(string => {
	return Array.from(string).map((el, i) => ({
		A: a_matrices[i],
		C: p_matrices_dictionary[el],
	}))
});

// todo: check that the order of multiplication is correct
// addendum: seems to be correct. double check still.
creasePatterns.forEach(singleVert => {
	singleVert.forEach(fold => {
		fold.x = fold.A.inverse().multiply(fold.C).multiply(fold.A);
	})
});

creasePatterns.forEach(singleVert => {
	singleVert.forEach((fold, i) => {
		let mat = math.matrix();
		for (let j = 0; j < i; j++) {
			// multiply inverse matrices
			mat = mat.multiply(singleVert[j].x.inverse())
		}
		// multiply
		mat = mat.multiply(singleVert[i].x);
		for (let j = i - 1; j >= 0; j--) {
			// multiply
			mat = mat.multiply(singleVert[j].x);
		}
		singleVert[i].L = mat;
	});
	let mat = math.matrix();
	for (let i = 0; i < singleVert.length; i++) {
		mat = mat.multiply(singleVert[i].L);
	}
	singleVert.mat = mat;
});

const cpIsValid = creasePatterns.map(el => el.mat.isIdentity());

const printMatrix = (mat) => `[ ${(mat[0]).toFixed(4)} ${(mat[3]).toFixed(4)} ${(mat[6]).toFixed(4)} ]\n[ ${(mat[1]).toFixed(4)} ${(mat[4]).toFixed(4)} ${(mat[7]).toFixed(4)} ]\n[ ${(mat[2]).toFixed(4)} ${(mat[5]).toFixed(4)} ${(mat[8]).toFixed(4)} ]\n`;


/////////////////////////////////////
// write files
//
const permString_valid = permutations
	.filter((_, i) => cpIsValid[i])
	.join("\n");
fs.writeFileSync("permutations_valid.txt", permString_valid);

const matString = creasePatterns
	// .map(el => el.mat.slice(0, 9).join(" ")) // one-line
	.map(el => printMatrix(el.mat))  // expanded view
	.join("\n");
fs.writeFileSync("matrices.txt", matString);

const isIdentity = creasePatterns
	.map(el => el.mat.isIdentity())
	.map((iden, i) => iden ? `${i}: true` : `${i}:`)
	.join("\n");
fs.writeFileSync("isIdentity.txt", isIdentity);

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
	a: "#00ff",
	b: "#00f8",
	c: "#fff0",
	d: "#f008",
	e: "#f00f",
};

const drawPermutation = (perm) => {
	const svg = SVG(-SIZE, -SIZE, SIZE * 2, SIZE * 2);
	Array.from(perm).map((letter, i) => {
		if (letter !== "c") {
			svg.line(...creaseCoords[i])
				.stroke(foldAngleStrokes[letter]);
		}
	});
	svg.rect(-SIZE, -SIZE, SIZE*2, SIZE*2)
		.fill("none")
		.stroke("#000");
	return svg.save();
}

const outputDir = "./svgs";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

if (fs) {
	permutations.forEach((perm, i) => {
		if (cpIsValid[i]) {
			const svg = drawPermutation(perm);
		  fs.writeFileSync(`${outputDir}/${i}.svg`, svg);
		}
	})
}

// console.log(p_matrices);
// console.log(a_matrices);
// console.log(permutations);
// console.log(creasePatterns);

console.log(`done. ${cpIsValid.reduce((a,b) => a+(b?1:0),0)} / ${permutations.length} valid cases`);
