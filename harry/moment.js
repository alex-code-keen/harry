
const moment = require('moment');

var a = moment('2016-01-01'); 
var b = a.clone().add(1, 'week'); 
console.log(a.format());