
"use strict"
global.Token = '';

class Voluum{
  constructor() {
    this._token;
  };

  get token(){
    this._token = Token;
    return this._token;
  }
  
  getToken(){  
    const rp = require('request-promise');
    var options =
    {
      method     : "post",   
      uri        : "https://api.voluum.com/auth/access/session",
      muteHttpExceptions: true,
      json: {
        "accessId"    : "b8aec6a7-72ec-4e5f-8f94-0c80e54a77c3",
        "accessKey"   : "xFOxbX4dPXovqg5NVF2Gu52zyk091EKH2V2U"  
      }          
    }; 
  
    // Return new promise 
    return new Promise(function(resolve, reject) {
     // Do async job
      rp( options, function(error, response, body) {
        if ( !error && response.statusCode == 200 )  {
          //console.log('003 ' + body.token);
          Token = body.token;
          resolve(body.token);
        } else {
          reject(error);
        };
      });
    });
  }

  getVoluum(url, encParams){  
    const rp = require('request-promise');    

    //console.log("201 " + Token);
     
    var options = {      
      method     : "get",
      uri        : url + encParams,
      contentType: "application/json",
      muteHttpExceptions: true,
      headers    : {
        "cwauth-token": Token        
      }          
    }; 
    
    // Return new promise 
    return new Promise(function(resolve, reject) {
     // Do async job
      rp( options, function(error, response, body) {
        if ( !error && response.statusCode == 200 )  {
          //console.log('007 ' + body);          
          resolve(body);
        } else {
          reject(error);
        };
      });
    });
  };
}
/*  fnGetToken().then( myToken=> {      
      console.log(`Got myToken = ${myToken}`);            
      this._token = myToken;
      console.log(`Got this._token 0 = ${this._token}`);
    })    
    .catch( error=> { 
      console.log('Got error from fnGetToken ', error);
    });*/    
/*
function fnRequestVoluumToken() {
  var request = require('request');      
  var options =
  {
    method     : "post",   
    uri        : "https://api.voluum.com/auth/access/session",
    muteHttpExceptions: true,
    json: {
      "accessId"    : "b8aec6a7-72ec-4e5f-8f94-0c80e54a77c3",
      "accessKey"   : "xFOxbX4dPXovqg5NVF2Gu52zyk091EKH2V2U"  
    }          
  }; 
  
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {        
      console.log('3 ' + body.token);
      this._token = body.token;  
      return body.token;  
    }
  });    
console.log('missed me');
}

//*************************************************

function fnGetToday() {

  var request = require('request');

  var urlToday     = 'https://api.voluum.com/shared-report/report/3hxhqQ5VQe-y9qd6cfo4dw';

  var options = {
    uri: urlToday,
    method: 'GET',
    //  json: {
    //  "longUrl": "http://www.google.com/"
    //}
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var params = JSON.parse(body);
      var obj = params.rows;
      //console.log(obj); // Print the google web page.
      var i = 0;            
      var arrData = [];

      for (key in obj){
        var sheetRow = [];
        var objRow = obj[key];     
        
        for (key1 in objRow){
          sheetRow.push(objRow[key1]);
          console.log(key1 + ':' + objRow[key1]);
        } // for (key1
        arrData[i] = sheetRow;
        i++;
        //Logger.log(key + ':' + );
      }; // for (key

      return arrData;

    }
  })
};
//************************************************************************

*/

module.exports = Voluum;