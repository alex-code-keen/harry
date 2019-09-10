
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

    var curMoment = new moment.utc().add(9,'hours'); // catch up with Seoul
    //var curDate   = curMoment.format('YYYY-MM-DD');    
    //var curTime   = curMoment.format('HH:mm:SS');      
    //var curShowTime = curMoment.format('HH') + ':00:00 - ' + curMoment.format('HH') + ':59:59';

    // set times periods for last 3 days
    var baseTime = curMoment; //.startOf('hour');
    var backDay  = [];

    var toTime   = baseTime.clone().add(1,'hours').startOf('hour').format('YYYY-MM-DDTHH') + ':00:00Z';
    var backDay0 = baseTime.clone().startOf('day').format('YYYY-MM-DD') + 'T00:00:00Z';
    var backDay1 = baseTime.clone().subtract(24,'hours').format('YYYY-MM-DD') +'T00:00:00Z';  //2018-10-10T00:00:00Z 
    var backDay2 = baseTime.clone().subtract(48,'hours').format('YYYY-MM-DD') +'T00:00:00Z';
    var backDay3 = baseTime.clone().subtract(72,'hours').format('YYYY-MM-DD') +'T00:00:00Z';

    backDay[0]   = baseTime.clone().startOf('day').unix();  
    backDay[1]   = baseTime.clone().subtract(24,'hours').unix(); 
    backDay[2]   = baseTime.clone().subtract(48,'hours').unix(); 
    backDay[3]   = baseTime.clone().subtract(72,'hours').unix(); 

    //console.log('Starting to getReports..');

    for ( var j = 0; j < arrCampaignIDs.length; j++ ){  

        var arrMainData = [];       
        var objRaw = []; 
        var objTemp;

        console.log('arrCampaignIDs['+ j +'] .. ' + arrCampaignIDs[j]);
        objTemp   = await objVoluum.getReport( backDay0, toTime, arrCampaignIDs[j] );                
        objRaw[0] = objTemp['totals'];
        objTemp   = await objVoluum.getReport( backDay1, backDay0, arrCampaignIDs[j] );
        objRaw[1] = objTemp['totals'];
        objTemp   = await objVoluum.getReport( backDay2, backDay1, arrCampaignIDs[j] );            
        objRaw[2] = objTemp['totals'];
        objTemp   = await objVoluum.getReport( backDay3, backDay2, arrCampaignIDs[j] );                           
        objRaw[3] = objTemp['totals'];

        // filter out empty and assemble the array from objects
        var arrRow = [];
        
        for ( let i = 0; i < objRaw.length; i++ ){
            if( objRaw[i]['visits'] > 0 
            || objRaw[i]['conversions'] > 0 
            || objRaw[i]['clicks'] > 0 
            || objRaw[i]['customConversions1'] > 0 
            || objRaw[i]['customConversions2'] > 0 
            || objRaw[i]['customRevenue1'] > 0 
            || objRaw[i]['customRevenue2'] > 0 
            || objRaw[i]['revenue'] > 0  ){
                
                arrRow = [];
                arrRow.push( backDay[i] );
                arrRow.push( arrCampaignIDs[j] );
                arrRow.push( objRaw[i]['visits'] );
                arrRow.push( objRaw[i]['clicks'] );
                arrRow.push( objRaw[i]['conversions'] );
                arrRow.push( objRaw[i]['customConversions1'] );
                arrRow.push( objRaw[i]['customConversions2'] );
                arrRow.push( objRaw[i]['customRevenue1'] );
                arrRow.push( objRaw[i]['revenue'] );
                arrRow.push( objRaw[i]['customRevenue2'] );    
                arrMainData.push(arrRow);
            } //if
        }; //i 
      
        arrMainData.sort( function(a,b){ return b[0]-a[0]; });

        console.log('records to push .. ' + arrMainData.length);
        //var arrMainArr = [];  

        arrMainData.forEach( async function(row){      
            var sheetRow = [];

            // place date readable
            var myDate = new moment(row[0]*1000).utc()//.add(9,'hours');
            sheetRow.push( myDate.format( 'YYYY-MM-DD' ) );    
            // place date raw unix number
            sheetRow.push(row[0]);
            // place Campaign ID
            sheetRow.push(row[1]);
            // place Campaign
            var rowNum = arrCampaignIDs.indexOf(row[1]);
            sheetRow.push( arrNew[rowNum][1] );          
            // visits - Visits
            sheetRow.push(row[29]);
            // clicks - Clicks
            sheetRow.push(row[4]);
            // conversions - Conversions
            sheetRow.push(row[5]);
            // customConversions1 - Leads
            sheetRow.push(row[10]);
            // customConversions2 - FTDs
            sheetRow.push(row[11]);
            // customRevenue1 - Leads revenue
            sheetRow.push(row[12]);
            // revenue - Revenue
            sheetRow.push(row[26]);
            // customRevenue2 - FTDs Revenue
            sheetRow.push(row[13]);

            //console.log('Date: ' + sheetRow[0] + '; CampaignID: '+ sheetRow[1] + '; Campaign: ' + sheetRow[2]);

            var sql = 'CALL sp_update_or_insert_voluum_daily(?)';            

            try {                
                var result = await pool.query(sql, [sheetRow]);
                console.log('Date: ' + sheetRow[0] + '; CampaignID: '+ sheetRow[1] + '; Campaign: ' + sheetRow[2]);
                //console.log("Number of records affected: " + result.affectedRows);
            } catch(err) {
                throw new Error(err);
                //console.log(err);
            } // try
            
        }); //arrMainData.forEach

    }; // j
};

try {
    main();
    console.log('Start.. ');
} catch (err){
    console.log(err);
};

