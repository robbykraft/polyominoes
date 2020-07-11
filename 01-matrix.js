const fs = require("fs")
const {
	Matrix,
	multiply_matrices3,
	determinant3,
	invert_matrix3,
	make_matrix3_rotateX,
	make_matrix3_rotateY,
	make_matrix3_rotateZ,
	is_identity3x4,
} = require("./matrix");
const timestamp = require("./timestamp")();
timestamp.begin();

const outputDir = "./output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

// from calculations in this code, we have found:
// 390,625 possible permutations of one crease pattern with:
//  - 8 fold lines
//  - each fold line is 1 of 5 fold angles: -180, -90, 0, 90, 180

// possible ps:
// -180, -90, 0, 90, 180
const fold_angles = [-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI];

// the dihedral fold angle.
const fold_angle_matrices = fold_angles
	.map(angle => make_matrix3_rotateX(angle));
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
	.map(angle => make_matrix3_rotateZ(angle));

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
		a: multiply_matrices3(multiply_matrices3(
				invert_matrix3(a_mat[i]), p_mat["a"]), a_mat[i]),
		b: multiply_matrices3(multiply_matrices3(
				invert_matrix3(a_mat[i]), p_mat["b"]), a_mat[i]),
		c: multiply_matrices3(multiply_matrices3(
				invert_matrix3(a_mat[i]), p_mat["c"]), a_mat[i]),
		d: multiply_matrices3(multiply_matrices3(
				invert_matrix3(a_mat[i]), p_mat["d"]), a_mat[i]),
		e: multiply_matrices3(multiply_matrices3(
				invert_matrix3(a_mat[i]), p_mat["e"]), a_mat[i]),
	}));

// pre calculate their inverses too
const crease_matrices_inv = crease_matrices.map(mats => ({
	a: invert_matrix3(mats["a"]),
	b: invert_matrix3(mats["b"]),
	c: invert_matrix3(mats["c"]),
	d: invert_matrix3(mats["d"]),
	e: invert_matrix3(mats["e"]),
}));

const fold_angles_description = {
	a: "-180°",
	b: "-90°",
	c: "0°",
	d: "90°",
	e: "180°",
};

const creaseMatrixString = crease_matrices
	.map((el, i) => `crease ${45*i}°\n\n` + ["a","b","c","d","e"]
		.map(key => `${fold_angles_description[key]}: ${el[key].slice(0, 9).join(" ")}`).join("\n")).join("\n\n"); 
fs.writeFileSync(`${outputDir}/log-crease-matrices.txt`, creaseMatrixString);

const cpMatrices = permutations.map(string => {
	const Ls = Array.from(string).map((char, i) => {
		// create a matrix that is the product of:
		//  1. the inverses
		//  2. this transform
		//  3. the not-inverses
		let mat = Matrix();
		for (let j = 0; j < i; j++) {
			mat = multiply_matrices3(mat, crease_matrices_inv[j][string[j]])
		}
		mat = multiply_matrices3(mat, crease_matrices[i][string[i]]);
		for (let j = i - 1; j >= 0; j--) {
			mat = multiply_matrices3(mat, crease_matrices[j][string[j]]);
		}
		return mat;
	});
	let mat = Matrix();
	Ls.forEach(L => { mat = multiply_matrices3(mat, L); });
	return mat;
});

const cpIsValid = cpMatrices.map(el => is_identity3x4(el));

const printMatrix = (mat) => `[ ${(mat[0]).toFixed(3)} ${(mat[3]).toFixed(3)} ${(mat[6]).toFixed(3)} ]\n[ ${(mat[1]).toFixed(3)} ${(mat[4]).toFixed(3)} ${(mat[7]).toFixed(3)} ]\n[ ${(mat[2]).toFixed(3)} ${(mat[5]).toFixed(3)} ${(mat[8]).toFixed(3)} ]\n`;

/////////////////////////////////////
// write files
//
// const permString_valid = permutations
// 	.filter((_, i) => cpIsValid[i])
// 	.join("\n");
// fs.writeFileSync(`${outputDir}/permutations_valid.txt`, permString_valid);

const text_matrices = cpMatrices
	// .map(el => el.mat.slice(0, 9).join(" ")) // one-line
	.map(el => printMatrix(el))  // expanded view
	.join("\n");
fs.writeFileSync(`${outputDir}/log-matrices.txt`, text_matrices);

// const text_isIdentity = cpIsValid
// 	.map((iden, i) => iden ? `${i}: true` : `${i}:`)
// 	.join("\n");
// fs.writeFileSync(`${outputDir}/isIdentity.txt`, text_isIdentity);

const validIndicesString = permutations
	.map((_, i) => cpIsValid[i] ? i : undefined)
	.filter(a => a !== undefined)
	.join("\n");
fs.writeFileSync(`${outputDir}/valid.txt`, validIndicesString);

const cpReport = `${cpIsValid.reduce((a,b) => a+(b?1:0),0)} / ${permutations.length} valid cases`;
const endTime = timestamp.end(cpReport);
console.log(`finished in ${endTime[0]} seconds`);
