/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSAuth = require("./../auth");
const crypto = require('crypto');

const AUTH='Authorization';
const PX_ZONE='Predix-Zone-Id';

class ECReportingApi extends RSAuth {

    constructor(option,debug){
	super(option);
	this._debug=debug;
    }

    init(req,res){
	this._req=req;
	this._res=res;

	try{
	    //zone-id
	    this._p=req.headers[PX_ZONE.toLowerCase()];

	    debugger;
	    this._ci = (new Buffer(req.headers[AUTH.toLowerCase()].split(' ')[1], 'base64')).toString().split(':');		    
	}
	catch(e){
	    this._debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url}. json:${req.headers[AUTH.toLowerCase()]} err:${e} (EC Internal API)`);
	    return false;
	}

	return true;
    }

    /*
     * /<base>/reports/usage
     *
     <body>
     { 
       "lastUsage":12345
       "agentGUID":"4234-25235-234235-235234"
       "refId":"0"
     }
     * 	this._options._gatewayInfo=
     {
       "agentGUID":{
            "refId":"0"
       }
     }
     */

    reportUsage(){

	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p, _gInfo=this._options._gatewayInfo;

	return new Promise((reso,reje)=>{
	    
	    _debug(`${new Date()} EC: ${process.env.ZONE} Received post request for ${req.url}. (EC Internal API)`);

	    debugger;

	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(ok=>{
		
		let _chunk='',_body;

		req.on('data',(chunk)=>{
		    _chunk+=chunk;
		});

		req.on('end', ()=>{
		    
		    debugger;
		    try {
			
			_body=JSON.parse(_chunk);
			
			let ip=parseInt(_body.lastUsage||0);
			
			_debug(`${new Date()} EC: ${process.env.ZONE} _body: ${JSON.stringify(_body)} for ${req.url} (EC Internal API)`);

			this.DecryptMsg(_body["data"],_ci[0],_ci[1]).then((obj)=>{

			    _body["status"]="EC_GRANT";
			    _body["lastUsage"]=ip;
			    _body["data"]=obj.data;

			    if (!_body["gtwId"]||!_body["refId"]){
				throw "incomplete infomation";
			    }
			    
			    _gInfo[_body["gtwId"]+":"+_body["refId"]]={
				refId: _body["refId"],
				gtwId: _body["gtwId"],
				zone: _body["zone"],
				cfURL: _body["cfRoutingURL"]||"n/a",
				timeCreated: (new Date()).getTime(),
				active: true
			    }

			    _debug(`${new Date()} EC: ${process.env.ZONE} _body: ${JSON.stringify(_body)} for ${req.url} (EC Internal API)`);
			    
			    debugger;

			    _debug(`${new Date()} EC: ${process.env.ZONE} usage report received. (EC Internal API)`);
			    
			    return reso({req:req,res:res,code:200,data:_body});
			    
			},(err)=>{
			    console.log(err);
			    return reje({req:req,res:res,code:501});
			});
			
		    }
		    catch(e){
			_debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url} err: ${e} (EC Internal API)`);
		    	return reje({req:req,res:res,code:501});
		    }
		  
		});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url}. Reason:${obj} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	});
    }

    getUnreportedUsage(){
	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{
	    
	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{

		return reso({req:req,res:res,code:200,data:this._options.reporting.usage});

	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	});
    }


}

module.exports=ECReportingApi;
