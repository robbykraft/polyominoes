const fs = require("fs");

const Timestamp = () => {
	const timestamp = {};
	let timeStart, timeEnd;
	timestamp.begin = () => {
		timeStart = process.hrtime();
	}
	timestamp.end = (logText = "") => {
		timeEnd = process.hrtime(timeStart);
		const timeReport = `finished in ${timeEnd[0]} seconds (${timeEnd[1] / 1000000} ms)`;
		fs.appendFileSync(`log.txt`, `${new Date()}\n${timeReport}\n${logText}\n`);
		return timeEnd;
	}
	return timestamp;
}

module.exports = Timestamp
