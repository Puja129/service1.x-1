/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSAuth = require("./../auth");

const AUTH='Authorization';
const PX_ZONE='Predix-Zone-Id';

class ECSecurityApi extends RSAuth {

    constructor(option,debug){
	super(option);
	this._debug=debug;
    }

    init(req,res){
	this._req=req;
	this._res=res;
	this._auth=new RSAuth(this._options);

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

    submitCSR(){
	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{
	    
	    _debug(`${new Date()} EC: ${process.env.ZONE} Received post request for ${req.url}. (EC Internal API)`);

	    debugger;

	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(ok=>{
		
		let _chunk='',_body;

		//Allowing CSR submission
		//if (process.env["PLAN_NAME"]!="Mutual-TLS"){
		//    return reje({req:req,res:res,code:501,status:"not supported by the plan type."});
		//}
		
		req.on('data',(chunk)=>{
		    _chunk+=chunk;
		});

		req.on('end', ()=>{
		    
		    debugger;
		    try {
			let obj=JSON.parse(_chunk);
			process.env["CSR_CONTENT"]=JSON.stringify(obj);
			
			_body={content:obj,requestTime:`${new Date()}`};	
			
			//if everything's fine
			_debug(`${new Date()} EC: ${process.env.ZONE} _body: ${JSON.stringify(_body)} for ${req.url} (EC Internal API)`);
		    	
		    }
		    catch(e){
			_debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url} (EC Internal API)`);
		    	return reje({req:req,res:res,code:501});
		    }

		    debugger;

		    _debug(`${new Date()} EC: ${process.env.ZONE} usage report received. (EC Internal API)`);
		    return reso({req:req,res:res,code:200,data:{status:'request received.',zoneId:_p}});
		    
		});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url}. Reason:${obj} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	});
    }

    getCSR(){
	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{

	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		
		try {

		    let cnt=process.env["CSR_CONTENT"];
		    if (cnt){
			process.env["CSR_CONTENT"]=false;
			return reso({req:req,res:res,code:201,content:cnt});
			
		    }
		    else {
			return reso({req:req,res:res,code:200,data:{status:"no pending CSR"}});
		    }
		    
		}
		catch(e){
		    _debug(`${new Date()} EC: ${process.env.ZONE} err:${e} (EC Internal API`);
		    return reje({req:req,res:res,code:501});
		}
		
	    }).catch((obj)=>{
		
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url}. Err: ${obj}  (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	});
    }

    getPublicKey(){
	let _debug=this._debug, req=this._req, res=this._res,
	    _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{
	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		
		try {

		    let cnt=process.env["EC_PUB_KEY"];
		    return reso({req:req,res:res,code:201,content:cnt});
		}
		catch(e){
		    _debug(`${new Date()} EC: ${process.env.ZONE} err:${e} (EC Internal API`);
		    return reje({req:req,res:res,code:501});
		}
		
	    }).catch((obj)=>{
		
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url}. Err: ${obj}  (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	});
    }
}

module.exports=ECSecurityApi;
