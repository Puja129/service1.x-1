/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const FS = require("fs");
const PATH = require("path");
const RSAuth = require("./../auth");

const AUTH='Authorization';
const PX_ZONE='Predix-Zone-Id';

class ECStaticApi extends RSAuth {

    constructor(option,debug){
	super(option);
	this._debug=debug;
    }

    init(req,res){
	this._req=req;
	this._res=res;

	return true;
    }

    //for UI only
    getUI(){
	let req=this._req,res=this._res,_debug=this._debug,
	    _ci,_z=process.env.ZONE;
	
	return new Promise((reso,reje)=>{

	    // no further info needed
	    try{

		_ci = (new Buffer(req.headers[AUTH.toLowerCase()].split(' ')[1], 'base64')).toString().split(':');

	    }
	    catch(e){
		this._debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url}. json:${req.headers[AUTH.toLowerCase()]} (EC Internal API)`);

		let hr={
		    "Content-Type": "application/json",
		    "WWW-Authenticate": `Basic realm="EC Service APIs"`
		};
		
		return reso({req:req,res:res,code:401,headers:hr,data:{status:'failed authorisation'}});	
	    }
	    
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_z).then(ok=>{

		let _p = PATH.normalize(req.url).replace(/^(\.\.[\/\\])+/, '').replace("/"+process.env.BASE+"/index","");

		if (_p.trim()==="/")
		    _p="/index.html";
		
		return FS.readFile("./assets"+_p,(err,data)=>{
		    if (err){
			_debug(`${new Date()} EC: ${process.env.ZONE} Invalid file request for ${req.url} err: ${err} (EC API)`);
			return reje({req:req,res:res,code:501});
		    }

		    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
		    res.setHeader("Access-Control-Allow-Origin", "https://www.predix.io");

		    _debug(`${new Date()} EC: ${process.env.ZONE} file request for ${req.url} (EC API)`);
		    return reso({req:req,res:res,code:200,content:data});
		});
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);

		let hr={
		    "Content-Type": "application/json",
		    "WWW-Authenticate": `Basic realm="EC Service APIs"`
		};
		
		return reso({req:req,res:res,code:401,headers:hr,data:{status:'failed authentication'}});			
	    });

	});
    }

    //for web gui
    getAsset(){
	let req=this._req,res=this._res,_debug=this._debug;
	
	return new Promise((reso,reje)=>{
	    
	    let _p = PATH.normalize(req.url).replace(/^(\.\.[\/\\])+/, '').replace("/ui","");
	    
	    if (_p.trim()==="/")
		_p="/index.html";

	    return FS.readFile("./ec-web-ui/build/default"+_p,(err,data)=>{

		if (err){
		    _debug(`${new Date()} EC: ${process.env.ZONE} Invalid file request for ${req.url} err: ${err} (EC API)`);
		    return reje({req:req,res:res,code:501});
		}

		_debug(`${new Date()} EC: ${process.env.ZONE} file request for ${req.url} (EC API)`);
		return reso({req:req,res:res,code:200,content:data});
	    });
	    
	});
    }

    //temp hosted in this api
    getRevision(){

	let _debug=this._debug, req=this._req, res=this._res;

	return new Promise((reso,reje)=>{
    	    
	    switch (req.method.toLowerCase()){
	    case "get":
		
		_debug(`${new Date()} EC: ${this._envs.application_name} Received get request for ${req.url} from ${req.headers.host}. (EC Internal API)`);

		return reso({req:req,res:res,code:200,data:{
		    sid:this._envs.application_name,
		    ver:process.env.BASE,
		    build:process.env.ENV,
		    plan:process.env.PLAN_NAME,
		    upgrade_logs: process.env.UPG_HISTORY
		}});

	    }
	});	

    }

    
}

module.exports=ECStaticApi;
