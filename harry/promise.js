
const Voluum = require('./voluum.js');

const objVoluum = new Voluum();

var fromTime   = '2018-11-13T00:00:00Z';
var toTime     = '2018-11-14T00:00:00Z';
var campaignId = '7b51a3d3-9b17-4487-8595-d0ccd8ad836e';

var url = 'https://api.voluum.com/report';

//var encParams1 = 'https://panel-api.voluum.com/report?from=2018-10-11T00:00:00Z&to=2018-10-12T00:00:00Z&tz=Etc%2FGMT&sort=visits' 
// 2018-10-10T00:00:00Z tz=Asia%2FSeoul  Etc%2FGMT
var encParams1 = '?from=' + fromTime + '&to=' + toTime + '&tz=Asia%2FSeoul&sort=hourOfDay' 
+ '&direction=asc&columns=hourOfDay&columns=visits&columns=clicks&columns=conversions&columns=revenue&columns=cost'
+ '&columns=profit&columns=cpv&columns=ctr&columns=cr&columns=cv&columns=roi&columns=epv&columns=epc&columns=ap'
+ '&groupBy=hour-of-day&offset=0&limit=100&include=ALL&conversionTimeMode=CONVERSION'
+ '&filter1=campaignId&filter1Value=' + campaignId;  



async function main() {    
    //let myVal = await objVoluum1.setToken();

    ////let myData = await objVoluum.getDataAwait( url, encParams1 );
    let myData = await objVoluum.getReport( fromTime, toTime, campaignId );
    //let myData = await objVoluum.getToday();
    
    
    console.log('100 ' + myData.totalRows);
    
}

main();