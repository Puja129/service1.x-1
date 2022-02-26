/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

//force setting for DEBUG env
process.env.DEBUG='EC:Service';

const net=require('net');
const fs = require('fs');
const http = require('http');
const https = require('https');
const RSAuth = require('./lib/auth');
const RSSession = require('./lib/session');
const RSIPFilter = require('./lib/ipfilter');
const RSApi = require("./lib/api");
const RSAccountMgr = require("./lib/managers/account-mgr");

class ECService extends RSSession {

    constructor(options){

	//obj to map conversion
	options.groups=new Map();
	
	//gateway info
 	options._gatewayInfo={};

	super(options);
	
	var fs = require('fs');
 
	fs.readFile(`./../svcs/${options['info']['id']}.json`, 'utf8', (err, data)=>{
	  let accMgr=new RSAccountMgr(options);
	  accMgr.debug("EC:Service");
	    
	  if (!err){ 
	    let _st = JSON.parse(data);
	    accMgr.InitAccounts(options['info']['id'],_st);
	  } else {
	
            if (process.env.EC_SETTING){
	      let accMgr=new RSAccountMgr(options);
	      accMgr.debug("EC:Service");
	      let _st=JSON.parse(new Buffer(process.env.EC_SETTING,'base64').toString());
	      accMgr.InitAccounts(options['info']['id'],_st);
	    }
	  }	  
	  
	  this.init(options);
	  this.replaceStrInJsonFile('./../assets/swagger.json',["host"],options["info"]["url"]);

	  let _dbg=this._debug;
	  this._getAdmHash().then((out)=>{
	      _dbg(`${new Date()} EC: ${process.env.EC_SVC_ID} _getAdmHash > out: ${JSON.stringify(out)}`);
	  });
	});	
    }

    _getAdmHash() {
	let _dbg=this._debug;
	return new Promise((reso,reje)=>{	    
		
		const ls = spawn('agent', ['-hsh', '-smp']);

		ls.stdout.on('data', (data) => {
		  reso({stdout: `${data}`});
		});

		ls.stderr.on('data', (data) => {
		  reje({stderr: `${data}`});
		});

		ls.on('close', (code) => {
 		  _dbg(`${new Date()} EC: ${process.env.EC_SVC_ID} child process (_getAdmHash) exited with code ${code}`);
		});
	});
    }
	
    init(options){

	const KEEPALIVE_GRACE=30000;
	const KEEPALIVE_INTERVAL=20000;
	
	debugger;
	
	const filter=new RSIPFilter(options);
	filter.debug("EC:Service");

	const adm_sockets=this.adm_sockets;

	const pool=this._pool;
	
	const debug=this.debug("EC:Service");

	const sessions=this._sockets;
	
	const originIsAllowed = (origin) => {
	    return true;
	}

	let httpServer;
	
	//if secured channel is needed
	if (options.ssl){
	    // ssl cert 
	    let sslOps = {
		key: fs.readFileSync(`${options.ssl.key}`),
		cert: fs.readFileSync(`${options.ssl.cert}`)
	    };
	    
	    httpServer = https.createServer(sslOps,this.failAuth(debug));
	    
	}
	else {
	    httpServer = http.createServer(this.failAuth(debug));
	}
	
	httpServer.listen(options.localPort, _=> {
	    debug(`${new Date()} EC: ${options["info"]["id"]} EC service is listening on port#${options.localPort}`);
	    this.emit(`service_listening`);
	});

    }
    
    failAuth(debug){

	debugger;
	const _api=new RSApi(this._options);
	_api.debug("EC:Service");
	_api.setAppSettings();

	//persist all info generated so far
	//_api.setAppSettings();
	
	return (req,res)=>{
	    
	    _api.hook(req,res).then((obj)=>{
		
		switch (obj.code){
		case 200:
		case 201:
		    if (obj.content){
			return obj.res.end(obj.content);
		    }	    

		    obj.res.writeHead(obj.code,{"Content-Type": "application/json"});
		    return obj.res.end(JSON.stringify(obj.data));
		case 202:
		case 501:		  
		    obj.res.writeHead(obj.code,{"Content-Type": "application/json"});
		    return obj.res.end(JSON.stringify(obj.data));

		
		case 301:
		    //redirect
		    return obj.res.end();
		    
		case 401:
		    obj.res.writeHead(obj.code,obj.headers);
		    return obj.res.end(JSON.stringify(obj.data));

		case 404:
		default:
		    obj.res.writeHead(obj.code,{"Content-Type": "application/json"});
		    return obj.res.end(JSON.stringify(obj.data));

		}
	    }).catch((obj)=>{
		this._debug(`${new Date()} EC: ${process.env.ZONE} call failed to pickup the call. obj info# ${obj}`);
		obj.res.writeHead(obj.code);
		return obj.res.end(JSON.stringify(obj.data));
	    });
	    
	}
    }

}

module.exports=ECService;
