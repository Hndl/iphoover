'use explicit'

const util 								= require("util");
var express 							= require("express");
var bodyParser 							= require("body-parser");

var CmdLineClass						= require('./lib/hndlCmdLine'); 

var app 								= express();


const HTTP_OK							= 200;
const HTTP_ERR							= 404;
const HTTP_IATP							= 418;

var hooverBag	= [];

function renderChart_01(){
	
	return ( {
        type: 'pie',
        data: {
            datasets: [{
                data: [
                    STUB_STATV[STUB_STAT_CREATE_F],
                    STUB_STATV[STUB_STAT_CREATE_S],
                    STUB_STATV[STUB_STAT_FINDCUS_F],
                    STUB_STATV[STUB_STAT_FINDCUS_S],
                    STUB_STATV[STUB_STAT_RETACC_F],
                    STUB_STATV[STUB_STAT_RETACC_S],
                    STUB_STATV[STUB_STAT_SEARCHP_F],
                    STUB_STATV[STUB_STAT_SEARCHP_S]
                ],
                backgroundColor: [
                    'rgba(255,99,  132, 0.2)',  // STUB_STAT_CREATE_F
			        'rgba(54, 162, 235, 0.2)',	// STUB_STAT_CREATE_S
			        'rgba(155,99,  132, 0.2)',  // STUB_STAT_FINDC_F
			        'rgba(54, 262, 235, 0.2)',	// STUB_STAT_FINDC_S
			        'rgba(155,99,  0, 0.2)',  // STUB_STAT_RETACC_F
			        'rgba(54, 052, 235, 0.2)',	// STUB_STAT_RETACC_S
			        'rgba(10,99,  0, 0.2)',  	// STUB_STAT_SEARCH_F
			        'rgba(100, 052, 235, 0.2)'	// STUB_STAT_SEARCHP_S
                ],
                borderColor: [
			    	'rgba(255, 99 , 132, 1 )',		// STUB_STAT_CREATE_F
			        'rgba(54 , 162, 235, 1)',		// STUB_STAT_CREATE_S
			        'rgba(155,99,  132, 1)',  	// STUB_STAT_FINDC_F
			        'rgba(54, 262, 235, 1)',		// STUB_STAT_FINDC_S
			        'rgba(155,99,  0, 1)',  	// STUB_STAT_RETACC_F
			        'rgba(54, 052, 235, 1)'	,	// STUB_STAT_RETACC_S
			         'rgba(10,99,  0, 0.2)',  	// STUB_STAT_SEARCH_F
			        'rgba(100, 052, 235, 0.2)'	// STUB_STAT_SEARCHP_S
			    ],
			    borderWidth: 1,
                label: 'Dataset 1'
            }],
            labels: [
                "cir-create-failure",
                "cir-create-success",
                "crm-findcust-failure",
                "crm-findcust-success",
                 "sv-retacc-failure",
                "sv-retacc-success",
                "crm-searchpackage-failure",
                "crm-searchpackage-success"
            ]
        },
        options: {
            responsive: true
        }
    });

	
}
function setIPWhiteList( _a){
	try{
		//util.log(`[INFO] IP Whitelist -${_a}`);
		IP_WHITELIST=_a.split(',');
		//util.log(`[INFO] IP Whitelist -${IP_WHITELIST}`);
	}catch(e){
		util.log(`[WARNING] ip whitelist unassigned! - $[err}`);
	}
}
function getIPWhiteList(){
	return (IP_WHITELIST);
}
function getIP(_r){
	let _ip = _r.connection.remoteAddress.split(':')[3];
	if (_ip == null ){
		_ip="";
	}
	return (_ip);
}

function allowed( _ip ){
	var b=false;
	var _ipwl=getIPWhiteList();
	if (_ipwl == null){
		util.log(`[WARN] default restricted, no IP whitelist supplied --ip`);
		return (b);
	}

	for ( var i = 0 ;i<_ipwl.length ; i++){
		if ( _ipwl[i].trim().toLowerCase()==='any' || _ipwl[i].trim() === _ip.trim()){
			b=true;
			i=_ipwl.length+1;
		}
	}
	util.log(`[INFO] [Auth:${b}] IP:${_ip} Allowed:'${getIPWhiteList()}'`);
	return (b);
}

function auth( req, res, next){
	try{
		if ( allowed( getIP(req) )){
			recordActivity(req,res,true);
			next();
		}else{
			recordActivity(req,res,false);
			res.status( HTTP_OK).send('unauthorised');
		}
	} catch ( err ){
		util.log(`auth exception ${err}`);
		res.status( HTTP_ERR).send('unauthorised - unexpected - unwanted');
	}
	
}

function recordActivity ( req, res, accepted ){
	
	try{
		//Time: new Date()
		//Method: req.method
		//URL 	: req.url
		//IP 	: getIP(req);
		let s = "ALLOWED:"+accepted+"^TIME:"+(new Date())+"^IP:."+getIP(req)+"^METHOD:"+req.method+"^URL:"+req.url;
		hooverBag.push(s);
		console.log(`[INFO] [ACTIVITY]-${s}`);
		
	} catch ( err ){
		console.log(`[ERR] [ACTIVITY]-${err}`);
	}
}	

function renderHTMLPage(req, res){
	let html = 
		`<html>
			<body>
				<table border=1>
					<tr><th>Allowed</th><th>Date</th><th>IP</th><th>Method</th><th>URL</th></tr>`;
	
	try{
		for ( var i = 0 ; i < hooverBag.length ; i++){
			dirt = hooverBag[i];
			if ( dirt){
				
				all = (dirt.split('^')[0]).split(':')[1];
				time = (dirt.split('^')[1]).split(':')[1];
				ip = (dirt.split('^')[2]).split(':')[1];
				meth = (dirt.split('^')[3]).split(':')[1];
				url = (dirt.split('^')[4]).split(':')[1];
				html=html+`<tr><td>${all}</td><td>${time}</td><td>${ip}</td><td>${meth}</td><td>${url}</td></tr>`;
			}
		}
		html = html + `</table></body></html>`;
	} catch (err){
		console.log(err);
		html=`error whilst rendering page - ${err}`;
	}
	return (html);
}
/**
 *
 * MAIN
 *
 **/

 var CmdLineArgs = new CmdLineClass(process.argv);

 console.dir(CmdLineArgs);

 setIPWhiteList( CmdLineArgs.get('--ips'));

//app.use(auth,bodyParser.json());
//app.use(auth,bodyParser.urlencoded({ extended: false }));

app.use(auth,function(req, res, next) {
	//util.log(`std route:${req.method} request for '${req.url}'`);
	//next(); 
	//hacky but quick
	res.status(HTTP_OK).send(renderHTMLPage( req,res));
});


console.log(`IP Hoover Running On Port:${CmdLineArgs.get('--p')}`);
app.listen(parseInt(CmdLineArgs.get('--p'),10));

			
