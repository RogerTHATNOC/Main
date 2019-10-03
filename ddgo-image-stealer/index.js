const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");

const writeStreamToFile = (uri, filename, callback) => {
	request.head(uri, function(err, res, body) {
		request(uri)
			.pipe(fs.createWriteStream(filename))
			.on("end", callback);
	});
};

const readFromFile = filepath => {
	return fs.readFileSync(path.join(__dirname + filepath));
};

const readFromGET = url => {
	return new Promise(async (resolve, reject) => {
		axios({ method: "get", responseType: "json", url })
			.then(async response => {
				let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
				await wait(5000);
				resolve(response.data);
			})
			.catch(err => reject(err));
	});
};

(async () => {
	var gogo_data = "";
	let counter = 0;

	do {
		if (counter === 0)
			gogo_data = JSON.parse(readFromFile("data/dataset.json"));
		const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

		const gogo_vqd = Object.values(gogo_data.vqd)[0];
		const gogo_next = `https://duckduckgo.com/${gogo_data.next}&vqd=${gogo_vqd}`;
		const gogo_title = gogo_data["results"].map(item => item.title);
		const gogo_images = gogo_data["results"].map(item => item.image);
		gogo_images.forEach(async (item, index) => {
			try {
				await writeStreamToFile(item, `data/${index}.jpg`, async () => {
					console.log(gogo_title[index]);
					await wait(15000);
				});
			} catch (err) {}
		});

		console.log(`${counter}`, gogo_next);
		gogo_data = await readFromGET(gogo_next);
		counter++;
	} while (gogo_data && counter < 10);
})();
