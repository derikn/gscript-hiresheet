var Converter = require("csvtojson").Converter

var converter = new Converter({});

converter.on("end_parsed", function(jsonArray){
	console.log(jsonArray);
})

require("fs").createReadStream("./file.csv").pipe(converter);