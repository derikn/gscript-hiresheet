var _ = require("underscore");

var schedule_file = require("./schedule_data.js");
var double_file = require("./double_data.js");

var schedule_data = schedule_file.schedule_data;
var double_data = double_file.double_data;


var databyEE = _.groupBy(schedule_data, 'EE');
var doublebyEE = _.groupBy(double_data, 'EE');

console.log(doublebyEE);
