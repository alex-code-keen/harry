
"use strict"
global.Token = '';

class Voluum{
  constructor() {
    this._token = null;
  };

  get token(){
    this._token = Token;
    return this._token;
  }
  
  async setToken(){  
    const request = require('request-promise');

    const options =
    {
      method     : "post",   
      uri        : "https://api.voluum.com/auth/access/session",
      muteHttpExceptions: true,
      json: {
        "accessId"    : "b8aec6a7-72ec-4e5f-8f94-0c80e54a77c3",
        "accessKey"   : "xFOxbX4dPXovqg5NVF2Gu52zyk091EKH2V2U"  
      }          
    }; 
    
    try {
        const body = await request(options);
        //console.log(body);        
        this._token = body.token;
        Token = body.token;
        return this._token;        
    } catch (err){
        console.log('Got an error:', err.message);
    }    
  }

  async getDataAwait(url, encParams){  

    const request = require('request-promise');       
     
    var options = {      
      method     : "get",
      uri        : url + encParams,
      contentType: "application/json",
      muteHttpExceptions: true,
      headers    : {
        "cwauth-token": Token        
      }          
		}; 
		
		var self = this;

		async function doJob(){

			try {

				return await request( options );							

			} catch (err){

				if (err.statusCode == 401 ){

					try {
						
						await self.setToken();
						
						let options = {      
							method     : "get",
							uri        : url + encParams,
							contentType: "application/json",
							muteHttpExceptions: true,
							headers    : {
								"cwauth-token": Token        
							}          
						}; 

						return await request( options );									

					} catch (err) {
						console.log ('err' + err.statusCode);
					}
				}
			};			
		};

		return await doJob();				

	};
	
	async getReport(fromTime,toTime, campaignId){

		var self = this;

		var encParam1 = '?from=' + fromTime + '&to=' + toTime + '&tz=Asia%2FSeoul&sort=hourOfDay' 
		+ '&direction=asc&columns=hourOfDay&columns=visits&columns=clicks&columns=conversions&columns=revenue&columns=cost'
		+ '&columns=profit&columns=cpv&columns=ctr&columns=cr&columns=cv&columns=roi&columns=epv&columns=epc&columns=ap'
		+ '&groupBy=hour-of-day&offset=0&limit=100&include=ALL&conversionTimeMode=CONVERSION'
		+ '&filter1=campaignId&filter1Value=' + campaignId;  
	 
		var url = 'https://api.voluum.com/report';

		var objData = await this.getDataAwait( url, encParam1 );		

		return JSON.parse(objData);

	};

	async getToday(){

		const request = require('request-promise');   

		var arrData  = [];
		//var urlYesterday = 'https://api.voluum.com/shared-report/report/FuOFyqrdQVitObxer1f09A?limit=1000';
		var urlToday     = 'https://api.voluum.com/shared-report/report/3hxhqQ5VQe-y9qd6cfo4dw?limit=1000';

		var options =	{
      method     : "get",
      uri        : urlToday,
      contentType: "application/json",
      muteHttpExceptions: true,
		};

		async function getUrlApp(options){
			return await new Promise(function(resolve, reject) {
				// Do async job
				request( options, function(error, response, jsonBody) {
				  if ( !error && response.statusCode == 200 )  {
						// console.log('003 ' + body);
						var body = JSON.parse(jsonBody);
						//var columns = body.columnMappings;
						var obj = body.rows;						
						var i = 0;            
    
						for (var key in obj){
							var sheetRow = [];
							var objRow = obj[key];  							
							
							for (var key1 in objRow){
								sheetRow.push(objRow[key1]);								
								//Logger.log(key1 + ':' + objRow[key1]);
							} // for (key1
							arrData[i] = sheetRow;
							//console.log('005 ' + sheetRow);   
							i++;
							//Logger.log(key + ':' + );
						}; // for (key

						resolve(arrData);
					} else {
					  reject(error);
					};
				});
			});
		};

		return await getUrlApp(options); 
	};
}

module.exports = Voluum;