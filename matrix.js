var EPSILON = 1e-6;

var identity3x4 = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

var multiply_matrices3 = function multiply_matrices3(m1, m2) {
  return [m1[0] * m2[0] + m1[3] * m2[1] + m1[6] * m2[2], m1[1] * m2[0] + m1[4] * m2[1] + m1[7] * m2[2], m1[2] * m2[0] + m1[5] * m2[1] + m1[8] * m2[2], m1[0] * m2[3] + m1[3] * m2[4] + m1[6] * m2[5], m1[1] * m2[3] + m1[4] * m2[4] + m1[7] * m2[5], m1[2] * m2[3] + m1[5] * m2[4] + m1[8] * m2[5], m1[0] * m2[6] + m1[3] * m2[7] + m1[6] * m2[8], m1[1] * m2[6] + m1[4] * m2[7] + m1[7] * m2[8], m1[2] * m2[6] + m1[5] * m2[7] + m1[8] * m2[8], m1[0] * m2[9] + m1[3] * m2[10] + m1[6] * m2[11] + m1[9], m1[1] * m2[9] + m1[4] * m2[10] + m1[7] * m2[11] + m1[10], m1[2] * m2[9] + m1[5] * m2[10] + m1[8] * m2[11] + m1[11]];
};
var determinant3 = function determinant3(m) {
  return m[0] * m[4] * m[8] - m[0] * m[7] * m[5] - m[3] * m[1] * m[8] + m[3] * m[7] * m[2] + m[6] * m[1] * m[5] - m[6] * m[4] * m[2];
};
var invert_matrix3 = function invert_matrix3(m) {
  var det = determinant3(m);

  if (Math.abs(det) < 1e-6 || isNaN(det) || !isFinite(m[9]) || !isFinite(m[10]) || !isFinite(m[11])) {
    return undefined;
  }

  var inv = [m[4] * m[8] - m[7] * m[5], -m[1] * m[8] + m[7] * m[2], m[1] * m[5] - m[4] * m[2], -m[3] * m[8] + m[6] * m[5], m[0] * m[8] - m[6] * m[2], -m[0] * m[5] + m[3] * m[2], m[3] * m[7] - m[6] * m[4], -m[0] * m[7] + m[6] * m[1], m[0] * m[4] - m[3] * m[1], -m[3] * m[7] * m[11] + m[3] * m[8] * m[10] + m[6] * m[4] * m[11] - m[6] * m[5] * m[10] - m[9] * m[4] * m[8] + m[9] * m[5] * m[7], m[0] * m[7] * m[11] - m[0] * m[8] * m[10] - m[6] * m[1] * m[11] + m[6] * m[2] * m[10] + m[9] * m[1] * m[8] - m[9] * m[2] * m[7], -m[0] * m[4] * m[11] + m[0] * m[5] * m[10] + m[3] * m[1] * m[11] - m[3] * m[2] * m[10] - m[9] * m[1] * m[5] + m[9] * m[2] * m[4]];
  var invDet = 1.0 / det;
  return inv.map(function (n) {
    return n * invDet;
  });
};
var make_matrix3_rotateX = function make_matrix3_rotateX(angle) {
  var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  return [1, 0, 0, 0, cos, sin, 0, -sin, cos, origin[0] || 0, origin[1] || 0, origin[2] || 0];
};
var make_matrix3_rotateY = function make_matrix3_rotateY(angle) {
  var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  return [cos, 0, -sin, 0, 1, 0, sin, 0, cos, origin[0] || 0, origin[1] || 0, origin[2] || 0];
};
var make_matrix3_rotateZ = function make_matrix3_rotateZ(angle) {
  var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  return [cos, sin, 0, -sin, cos, 0, 0, 0, 1, origin[0] || 0, origin[1] || 0, origin[2] || 0];
};

var is_identity3x4 = function is_identity3x4(m) {
  return identity3x4.map(function (n, i) {
    return Math.abs(n - m[i]) < EPSILON;
  }).reduce(function (a, b) {
    return a && b;
  }, true);
};

var Matrix = function Matrix() {
	return [...identity3x4];
}

module.exports = {
	Matrix,
	multiply_matrices3,
	determinant3,
	invert_matrix3,
	make_matrix3_rotateX,
	make_matrix3_rotateY,
	make_matrix3_rotateZ,
	is_identity3x4,
};

// how to use transforms
// create the transform, put it in the second spot of the multiply func
//
// multiply_matrices3(this, make_matrix3_rotateX(radians));
