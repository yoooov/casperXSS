var casper = require('casper').create({
    logLevel: 'warning',
    verbose: true,
    onAlert: function(msg) {

        Message = 'XSS verified ' + msg + '';
        var vulnWarning = Message.replace(/\[object Casper\]/g, "");
        casper.log(vulnWarning);
        vulns.push(vulnWarning);

    },
    XSSAuditingEnabled: false
});

var fs = require('fs');
var utils = require('utils');
var data = fs.read('rsnake.txt');
var xss = data.toString().split("\n");

var payloads = [];
var cookieFile = casper.cli.get("cookiejar");
var url = casper.cli.get("url");
var string = casper.cli.raw.get("string");
var params = []
var detectedParameters;
var vulns = [];
var intro = fs.read('intro.txt');
var count;

try {
    var uri = url.split('?');
    var queryString = uri[1];
    var uri = uri[0];

} catch (err) {

}

var storedParamValues


var casperXSS = {
    analyze: function() {

        var setParameters = function(setpayloads) {
            for (i = 0; i < params.length; i++) {
                console.log("Detected the \"" + params[i] + "\" parameter, adding it into scope.");
            }
            setpayloads()
        }

        setParameters(this.setPayloads);
    },
    setPayloads: function() {

        for (z = 0; z < params.length; z++) {
           

            for (x = 0; x < xss.length; x++) {
  
                    var payloadString = uri + '?' + params[z] + '=' + xss[x]
                    for (y = 0; y < params.length; y++) {
                    	if(y != z){
                    		payloadString += '&' + storedParamValues[y]
                    	}
                        
                    }
                    payloads.push(payloadString);
                

            }
        }

        casperXSS.scan()

    },
    detectParameters: function(url, analyze) {


        storedParamValues = queryString.split('&')
        detectedParameters = queryString.split('&');

        for (i = 0; i < detectedParameters.length; i++) {
            tempParam = detectedParameters[i].replace(/(=.*)/i, "");
            params.push(tempParam);
        }

        analyze();

    },
    scan: function() {
        console.log('\nTrying ' + payloads.length + ' payloads on a total of ' + params.length + ' parameter. \nSit back and enjoy the ride.\n');

        // add regex to clean up xss validation msg (\[object Casper\], currently at)


        casper.start(url, function(status) {


        });
        casper.run()



        casper.then(function() {
            // temporarily registering listener
        });

        function testPayload(url, count, total) {

            casper.thenOpen(url, function(status) {

                //Page is loaded!
                console.log('Current Payload: ' + url);

                if (count === total - 1) {


                    casper.echo('Scan Completed!', 'INFO');
                    console.log(vulns.length + ' payloads succeeded:\n');

                    if (vulns) {

                        for (i = 0; i < vulns.length; i++) {
                            casper.echo('Verified XSS:', 'ERROR');
                            console.log(vulns[i] + '\n');

                        }
                    }

                }

            });

        }

        for (i = 0; i < payloads.length; i++) {

            testPayload(payloads[i], i, payloads.length);
        }
    }
}

if (cookieFile) {
    var filedata = fs.read(cookieFile);
    var jsonCookies = JSON.parse(filedata);
    console.log("Taking your cookies and putting them into a jar")
    for (i = 0; i < jsonCookies.length; i++) {
        phantom.addCookie({
            'name': jsonCookies[i].name,
            'value': jsonCookies[i].value,
            'domain': jsonCookies[i].domain,
            'hostOnly': jsonCookies[i].hostOnly,
            'secure': jsonCookies[i].secure,
            'session': jsonCookies[i].session,
            'storeId': jsonCookies[i].storeId,
            'httpOnly': jsonCookies[i].httpOnly
        })
    }
}


if (!url) {
    console.log('\n' + intro)
    console.log('\nA valid URL is missing, please try again Ex: casperjs xss.js --url=\"http://example.com?param1=vuln&param2=somevalue\"')
    console.log('Currently casperXSS only supports GET requests and parameters within the query string...more to come');
    console.log('\nIf your scan needs to be authenticated, currently you can import cookies (in JSON format) via the --cookiejar option');
    console.log('(Chrome extension \"Edit This Cookie\" works great at exporting to JSON)');
    console.log('\ncasperXSS v0.1.0')
    casper.exit();
} else {
    casperXSS.detectParameters(url, function() {
        casperXSS.analyze();
    });
}
