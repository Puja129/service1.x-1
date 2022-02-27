/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSAuth = require("./../auth");

const AUTH='Authorization';
const PX_ZONE='Predix-Zone-Id';

class ECHealthApi extends RSAuth {

    constructor(options,debug){
	super(options);
	this._debug=debug;
    }

    init(req,res){
	this._req=req;
	this._res=res;
	
	try{
	    //zone-id
	    this._p=req.headers[PX_ZONE.toLowerCase()];
	
	    if (this._req.headers.origin&&(this._req.headers.origin.indexOf("localhost")>-1||this._req.headers.origin.indexOf("ec-web-ui")>-1)){
		this._res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
		this._res.setHeader("Access-Control-Allow-Origin", "*");
	    }

	    debugger;

	    this._ci = (new Buffer(req.headers[AUTH.toLowerCase()].split(' ')[1], 'base64')).toString().split(':');
	}
	catch(e){
	    this._debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url}. json:${req.headers[AUTH.toLowerCase()]} err: ${e} (EC Internal API)`);
	    return false;
	}

	return true;

    }
    
    checkStatus(){

	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{

	    switch (req.method.toLowerCase()){
	    case "get":

		_debug(`${new Date()} EC: ${this._envs.application_name} Received get request for ${req.url}. (EC Internal API)`);

		//secure the call
		return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		    
		    _debug(`${new Date()} EC: ${this._envs.application_name} Received get request for ${req.url} from ${req.headers.host}. (EC Internal API)`);
		    return reso({req:req,res:res,code:200,data:{status:'ok'}});

		}).catch((obj)=>{
		    _debug(`${new Date()} EC: ${this._envs.application_name} authentication failed for ${req.url} (EC Internal API)`);
		    return reje({req:req,res:res,code:404,data:{status:'failed authentication'}});			
		});
	    }
	});	
    }

    checkMemory(){

	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p, _this=this;

	return new Promise((reso,reje)=>{
    	    
	    _debug(`${new Date()} EC: ${_this._options['info']['id']} checkMemory called`);
		
	    switch (req.method.toLowerCase()){
	    case "get":

		_debug(`${new Date()} EC: ${_this._options['info']['id']} Received get request for ${req.url}. (EC Internal API)`);

		//secure the call
		return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		    
		    _debug(`${new Date()} EC: ${_this._options['info']['id']} Received get request for ${req.url} from ${req.headers.host}. (EC Internal API)`);

		    return reso({req:req,res:res,code:200,data:{status:'ok', data:{memory:process.memoryUsage(),cpu:process.cpuUsage()}}});

		}).catch((obj)=>{
		    _debug(`${new Date()} EC: ${_this._options['info']['id']} authentication failed for ${req.url} (EC Internal API)`);
		    return reje({req:req,res:res,code:404,data:{status:'failed authentication'}});			
		});
	    }
	});	

    }
}

module.exports=ECHealthApi;
