const fs = require("fs")
const SVG = require("rabbit-ear-svg");
const math = require("./math");

const timeStart = process.hrtime();
const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

// from calculations in this code, we have found:
// 390,625 possible permutations of one crease pattern with:
//  - 8 fold lines
//  - each fold line is 1 of 5 fold angles: -180, -90, 0, 90, 180

// possible ps:
// -180, -90, 0, 90, 180
const fold_angles = [-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI];

const fold_angles_description = {
	a: "-180°",
	b: "-90°",
	c: "0°",
	d: "90°",
	e: "180°",
};

// the dihedral fold angle.
const fold_angle_matrices = fold_angles
	.map(angle => math.matrix().rotateX(angle));
const p_mat = {
	a: fold_angle_matrices[0],
	b: fold_angle_matrices[1],
	c: fold_angle_matrices[2],
	d: fold_angle_matrices[3],
	e: fold_angle_matrices[4],
}
// rotate 1/8 45deg crease lines into place along the X axis
const a_mat = Array.from(Array(8))
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
fs.writeFileSync(`${outputDir}/permutations.txt`, permString);

///////////////////////////////////////////
//
//  CLIP DATA
//  to speed up program. smaller data set.

// permutations.splice(1000);
// permutations.unshift("dcdcdcea");
// permutations.unshift("cccccccc");
// console.log(permutations);

//
///////////////////////////////////////////

// pre-calculate every type of individual crease-line matrix
//
//  \ | /
//   \|/
//  --o--
//   /|\
//  / | \
//
// one of eight creases can have one of five assignments
// "crease_matrices" is an array: 1-8. each spot is an object: keys: a-e
// inside there is a matrix


// todo: check that the order of multiplication is correct
// addendum: seems to be correct. double check still.
const crease_matrices = Array.from(Array(8))
	.map((_, i) => ({
		a: a_mat[i].inverse().multiply(p_mat["a"]).multiply(a_mat[i]),
		b: a_mat[i].inverse().multiply(p_mat["b"]).multiply(a_mat[i]),
		c: a_mat[i].inverse().multiply(p_mat["c"]).multiply(a_mat[i]),
		d: a_mat[i].inverse().multiply(p_mat["d"]).multiply(a_mat[i]),
		e: a_mat[i].inverse().multiply(p_mat["e"]).multiply(a_mat[i]),
	}));

// pre calculate their inverses too
const crease_matrices_inv = crease_matrices
	.map(mats => ({
		a: mats["a"].inverse(),
		b: mats["b"].inverse(),
		c: mats["c"].inverse(),
		d: mats["d"].inverse(),
		e: mats["e"].inverse(),
	}));

const creaseMatrixString = crease_matrices
	.map((el, i) => `crease ${45*i}°\n\n` + ["a","b","c","d","e"]
		.map(key => `${fold_angles_description[key]}: ${el[key].slice(0, 9).join(" ")}`).join("\n")).join("\n\n"); 
fs.writeFileSync(`${outputDir}/crease_matrices.txt`, creaseMatrixString);

// const creasePatterns = permutations.map(string => {
// 	return Array.from(string).map((el, i) => ({
// 		A: a_mat[i],
// 		C: p_mat[el],
// 	}))
// });
// creasePatterns.forEach(singleVert => {
// 	singleVert.forEach(fold => {
// 		fold.x = fold.A.inverse().multiply(fold.C).multiply(fold.A);
// 	})
// });

const creasePatterns = permutations.map(string => Array.from(string)
	.map((char, i) => ({
		x: crease_matrices[i][char],
		x_inv: crease_matrices_inv[i][char]
	})));

const cpMatrices = permutations.map(string => {
	const Ls = Array.from(string).map((char, i) => {
		// x: crease_matrices[i][char],
		// x_inv: crease_matrices_inv[i][char]
		let mat = math.matrix();
		for (let j = 0; j < i; j++) {
			mat = mat.multiply(crease_matrices_inv[j][string[j]])
		}
		mat = mat.multiply(crease_matrices[i][string[i]]);
		for (let j = i - 1; j >= 0; j--) {
			// multiply
			mat = mat.multiply(crease_matrices[j][string[j]]);
		}
		return mat;
	});
	let mat = math.matrix();
	Ls.forEach(L => { mat = mat.multiply(L); });
	return mat;
});

// creasePatterns.forEach(singleVert => {
// 	singleVert.forEach((char, i) => {
// 		let mat = math.matrix();
// 		for (let j = 0; j < i; j++) {
// 			// multiply inverse matrices
// 			mat = mat.multiply(singleVert[j].x_inv)
// 		}
// 		// multiply
// 		mat = mat.multiply(singleVert[i].x);
// 		for (let j = i - 1; j >= 0; j--) {
// 			// multiply
// 			mat = mat.multiply(singleVert[j].x);
// 		}
// 		singleVert[i].L = mat;
// 	});
// 	let mat = math.matrix();
// 	for (let j = 0; j < singleVert.length; j++) {
// 		mat = mat.multiply(singleVert[j].L);
// 	}
// 	for (let j = 0; j < singleVert.length; j++) {
// 		delete singleVert[j].L;
// 	}
// 	singleVert.mat = mat;
// });

// const cpIsValid = creasePatterns.map(el => el.mat.isIdentity());
const cpIsValid = cpMatrices.map(el => el.isIdentity());

const printMatrix = (mat) => `[ ${(mat[0]).toFixed(3)} ${(mat[3]).toFixed(3)} ${(mat[6]).toFixed(3)} ]\n[ ${(mat[1]).toFixed(3)} ${(mat[4]).toFixed(3)} ${(mat[7]).toFixed(3)} ]\n[ ${(mat[2]).toFixed(3)} ${(mat[5]).toFixed(3)} ${(mat[8]).toFixed(3)} ]\n`;


/////////////////////////////////////
// write files
//
const permString_valid = permutations
	.filter((_, i) => cpIsValid[i])
	.join("\n");
fs.writeFileSync(`${outputDir}/permutations_valid.txt`, permString_valid);

const text_matrices = cpMatrices
	// .map(el => el.mat.slice(0, 9).join(" ")) // one-line
	.map(el => printMatrix(el))  // expanded view
	.join("\n");
fs.writeFileSync(`${outputDir}/matrices.txt`, text_matrices);

const text_isIdentity = cpIsValid
	.map((iden, i) => iden ? `${i}: true` : `${i}:`)
	.join("\n");
fs.writeFileSync(`${outputDir}/isIdentity.txt`, text_isIdentity);

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
	a: "#00f", // "#00ff",
	b: "#00f", // "#00f8",
	c: "#fff", // "#fff0",
	d: "#f00", // "#f008",
	e: "#f00", // "#f00f",
};
const foldAngleOpacities = {
	a: "1.0",
	b: "0.5",
	c: "1.0",
	d: "0.5",
	e: "1.0",
};

const drawPermutation = (perm) => {
	const svg = SVG(-SIZE, -SIZE, SIZE * 2, SIZE * 2);
	Array.from(perm).map((letter, i) => {
		if (letter !== "c") {
			svg.line(...creaseCoords[i])
				.stroke(foldAngleStrokes[letter])
				.opacity(foldAngleOpacities[letter]);
		}
	});
	svg.rect(-SIZE, -SIZE, SIZE*2, SIZE*2)
		.fill("none")
		.stroke("#000");
	return svg.save();
}

const svgDir = outputDir + "/svgs";
fs.existsSync(svgDir) || fs.mkdirSync(svgDir);

if (fs) {
	permutations.forEach((perm, i) => {
		if (cpIsValid[i]) {
			const svg = drawPermutation(perm);
		  fs.writeFileSync(`${svgDir}/${i}.svg`, svg);
		}
	})
}

// console.log(p_mat);
// console.log(a_mat);
// console.log(permutations);
// console.log(creasePatterns);

const timeEnd = process.hrtime(timeStart);
const timeReport = `finished in ${timeEnd[0]} seconds (${timeEnd[1] / 1000000} ms)`;
const cpReport = `${cpIsValid.reduce((a,b) => a+(b?1:0),0)} / ${permutations.length} valid cases`;

console.log(`${timeReport}\n${cpReport}`);
fs.writeFileSync(`${outputDir}/log.txt`, `${timeReport}\n${cpReport}`);
