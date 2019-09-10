function CalculateSig(stringToSign, privateKey){
        //calculate the signature needed for authentication
        var hash = CryptoJS.HmacSHA1(stringToSign, privateKey);
        var base64 = hash.toString(CryptoJS.enc.Base64);
        return encodeURIComponent(base64);
    }
 
    //set variables
    var d = new Date;
    var expiration = 3600; // 1 hour,
    var unixtime = parseInt(d.getTime() / 1000);
    var future_unixtime = unixtime + expiration;
    var publicKey = "your_public_key";
    var privateKey = "your_private_key";
    var method = "GET";
    var route = "forms/1/entries";
 
    stringToSign = publicKey + ":" + method + ":" + route + ":" + future_unixtime;
    sig = CalculateSig(stringToSign, privateKey);
    var url = 'http://localhost/wp.dev/gravityformsapi/' + route + '?api_key=' + publicKey + '&signature=' + sig + '&expires=' + future_unixtime;
    $.get(url, function(data, textStatus)
    {
        //get the data from the api
        if ( data.status != 200 || ( typeof( data ) != 'object' ) ) {
            //http request failed
            document.write( 'There was an error attempting to access the API - ' + data.status + ': ' + data.response );
            return;
        }
        response          = data.response;
        entries           = response.entries; //entries is a collection of Entry objects
        total_count       = response.total_count;
    });