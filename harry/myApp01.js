
"use strict"

const Voluum = require('./voluum.js');
//const cron   = require('node-cron');
const moment = require('moment');
const pool   = require('./db_mysql.js');

const objVoluum = new Voluum();

async function main(){
    // get 'Today' report to extract data for Campaigns
    var arrNew = await objVoluum.getToday();
    if ( arrNew.length == 0 ) { return };
    
    //console.log('getToday..');

    // make indexes  
    var arrCampaignIDs = [];    
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  
    for (var i = 0; i < arrNew.length; i++ ) { arrCampaignIDs[i] = arrNew[i][0] }; 
    //for (var i = 0; i < 5; i++ ) { arrCampaignIDs[i] = arrNew[i][0] }; 
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  

    //console.log('arrCampaignIDs..');

    var curMoment = new moment.utc().add(9,'hours'); // catch up with Seoul
    var curDate   = curMoment.format('YYYY-MM-DD');    
    var curTime   = curMoment.format('HH:mm:SS');      
    var curShowTime = curMoment.format('HH') + ':00:00 - ' + curMoment.format('HH') + ':59:59';

    // set times periods for last 3 days
    var baseTime = curMoment.startOf('hour');
    var toTime   = baseTime.format('YYYY-MM-DDTHH:mm:SS') + 'Z'; 
    var backDay0 = baseTime.clone().startOf('day').format('YYYY-MM-DD') + 'T00:00:00Z';  
    var backDay1 = baseTime.clone().subtract(24,'hours').format('YYYY-MM-DD') +'T00:00:00Z';  //2018-10-10T00:00:00Z                       
    var backDay2 = baseTime.clone().subtract(48,'hours').format('YYYY-MM-DD') +'T00:00:00Z';
    var backDay3 = baseTime.clone().subtract(72,'hours').format('YYYY-MM-DD') +'T00:00:00Z';

    //console.log('Starting to getReports..');

    for ( var j = 0; j < arrCampaignIDs.length; j++ ){  

        var arrMainData = [];
        //console.log('backDay0 .. ' + backDay0);
        //console.log('toTime .. ' + toTime);
        console.log('arrCampaignIDs['+ j +'] .. ' + arrCampaignIDs[j]);
        var objRaw0 = await objVoluum.getReport( backDay0, toTime, arrCampaignIDs[j] );        
        //console.log('objRaw0 .. ' + objRaw0.rows);
        var objRaw1  = await objVoluum.getReport( backDay1, backDay0, arrCampaignIDs[j] );            
        var objRaw2  = await objVoluum.getReport( backDay2, backDay1, arrCampaignIDs[j] );            
        var objRaw3  = await objVoluum.getReport( backDay3, backDay2, arrCampaignIDs[j] );            
        
        var arrTemp = objRaw0.rows.concat( objRaw1.rows, objRaw2.rows, objRaw3.rows );  

        // filter out empty and assemble the array from objects
        var arrRow = [];
        
        for ( let i = 0; i < arrTemp.length; i++ ){
            if( arrTemp[i]['visits'] > 0 
            || arrTemp[i]['conversions'] > 0 
            || arrTemp[i]['clicks'] > 0 
            || arrTemp[i]['customConversions1'] > 0 
            || arrTemp[i]['customConversions2'] > 0 
            || arrTemp[i]['customRevenue1'] > 0 
            || arrTemp[i]['customRevenue2'] > 0 
            || arrTemp[i]['revenue'] > 0  ){
                arrRow = [];
                arrRow.push( arrCampaignIDs[j] );
                for ( var key in arrTemp[i] ){            
                    arrRow.push( arrTemp[i][key] );
                    //console.log( key + ':' + arrData[i][key] );
                }        
                //console.log(arrRow[17], arrRow[18], arrRow[19], arrRow[20], arrRow[21]);          
                arrMainData.push(arrRow);
            } //if
        }; //i 
      
        arrMainData.sort(function(a,b){return b[20]-a[20] || b[21]-a[21] });

        console.log('records to push .. ' + arrMainData.length);
        //var arrMainArr = [];  

        arrMainData.forEach( async function(row){      
            var sheetRow = [];

            // place date   
            var myDate = new moment(row[20]).utc().add(9,'hours');    
            sheetRow.push( myDate.format( 'YYYY-MM-DD' ) );
            //sheetRow.push(row[20]);

            // place DayHour 0..23
            sheetRow.push(row[21]);

            // place readable time
            var myTime  = myDate;//.startOf('day');
            var myStart = myTime.clone().add( row[21], 'hours' ).format( 'HH:mm:SS' ) + ' - ';
            var myEnd   = myTime.clone().add( row[21], 'hours' ).format( 'HH' ) + ':59:59';
            sheetRow.push( myStart + myEnd );       

            // place Campaign ID
            sheetRow.push(row[0]);
            // place Campaign
            var rowNum = arrCampaignIDs.indexOf(row[0]);
            sheetRow.push( arrNew[rowNum][1] );
            //sheetRow.push( 'CampaignName' );

            // visits - Visits
            sheetRow.push(row[28]);
            // clicks - Clicks
            sheetRow.push(row[3]);
            // conversions - Conversions
            sheetRow.push(row[4]);
            // customConversions1 - Leads
            sheetRow.push(row[9]);
            // customConversions2 - FTDs
            sheetRow.push(row[10]);
            // customRevenue1 - Leads revenue
            sheetRow.push(row[11]);
            // revenue - Revenue
            sheetRow.push(row[25]);
            // customRevenue2 - FTDs Revenue
            sheetRow.push(row[12]);

            var sql = 'CALL sp_update_or_insert_voluum(?)';

            //console.log('Date: ' + sheetRow[0] + '; DayHour: '+ sheetRow[1] + '; CampaignID: ' + sheetRow[3]);

            try {                
                var result = await pool.query(sql, [sheetRow]);
                console.log('Date: ' + sheetRow[0] + '; DayHour: '+ sheetRow[1] + '; CampaignID: ' + sheetRow[3]);
                //console.log("Number of records affected: " + result.affectedRows);
            } catch(err) {
                throw new Error(err);
                //console.log(err);
            } // try
            
        }); //arrMainData.forEach

    }; // j
};

/*
var job = new cron.CronJob("* * * * *", function(){
    console.log('Running cron job..');
    try {
        //main();
    } catch (err){};
})
*/

try {
    main();
    console.log('Start.. ');
} catch (err){
    console.log(err);
};

