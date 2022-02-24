/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSAuth = require("./../auth");
const crypto = require('crypto');

const AUTH='Authorization';
const PX_ZONE='Predix-Zone-Id';

class ECUserApi extends RSAuth {

    constructor(option,debug){
	super(option);
	this._debug=debug;
    }

    init(req,res){

	this._req=req;
	this._res=res;
	
	try{

	    this._o=req.headers[AUTH.toLowerCase()].split(' ')[1];

	    this._p=req.headers[PX_ZONE.toLowerCase()];

	}
	catch(e){
	    this._debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url}. json:${req.headers[AUTH.toLowerCase()]} (EC Internal API)`);
	    return false;
	}

	return true;
    }

    /* deprecate for potential security leak
    getSettings(){

	let _debug=this._debug, req=this._req, res=this._res,
	    auth=this._auth, _o=this._o, _p=this._p;

	return new Promise((reso,reje)=>{
	    
	    _debug(`${new Date()} EC: ${process.env.ZONE} received get request for ${req.url} (EC API)`);
	    
	    debugger;

	    return auth.validate({oauthToken:_o,clientType:'user-api'},_p).then(info=>{

		debugger;
		
		let _s=this.GetAccount(_p.toString());
		
		if (!_s){
		    _debug(`${new Date()} EC: ${process.env.ZONE} account does not exist for ${req.url} (EC Internal API)`);
		    return reso({req:req,res:res,code:401});
		}

		return reso({req:req,res:res,code:200,data:_s});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });		    

	});
    }
    */

    tokenValidate(){

	let _debug=this._debug, req=this._req, res=this._res,
	    _p=this._p, _o=this._o;

	return new Promise((reso,reje)=>{

	    _debug(`${new Date()} EC: ${process.env.ZONE} received post request for ${req.url} (EC API)`);
	    
	    debugger;

	    return this.validate({oauthToken:_o,clientType:'user-api'},_p).then(info=>{

		debugger;

		return reso({req:req,res:res,code:200,data:{"status":"token is valid.","code":"192001","plan":process.env['PLAN_NAME']}});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} err:${JSON.stringify(obj)} (EC External API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });		    
	});
    }

    getPublicKey(){
	let _debug=this._debug, req=this._req, res=this._res,
	    _p=this._p, _o=this._o;

	return new Promise((reso,reje)=>{
	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    //secure the call
	    return this.validate({oauthToken:_o,clientType:'user-api'},_p).then(info=>{
		
		try {
		    let cnt=process.env["EC_PUB_KEY"];
		    return reso({req:req,res:res,code:201,content:cnt});
		}
		catch(e){
		    _debug(`${new Date()} EC: ${process.env.ZONE} err:${e} (EC Internal API`);
		    return reje({req:req,res:res,code:501});
		}
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} err:${JSON.stringify(obj)} (EC External API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });

	});
    }
    
    xchangeGatewayList(){

	let _debug=this._debug, req=this._req, res=this._res,
	    _p=this._p, _o=this._o, _gInfo=this._options._gatewayInfo;
	
	return new Promise((reso,reje)=>{
	    
	    //secure the call
	    return this.validate({oauthToken:_o,clientType:'user-api'},_p).then(info=>{
			
		let _chunk='',_body;

		req.on('data',(chunk)=>{
		    _chunk+=chunk;
		});

		req.on('end', ()=>{
		    
		    debugger;
		    try {

			_body=JSON.parse(_chunk);

			let usr=process.env.ADMIN_USR,
			    tkn=process.env.ADMIN_TKN;

			this.DecryptMsg(_body["data"],usr,tkn).then((obj)=>{

			    //if everything's fine
			    for (let k in _body.glist) {
				let op=_body.glist[k];

				if (op&&!op.active){
				    delete _gInfo[k]
				}
			    }

			    _debug(`${new Date()} EC: ${process.env.ZONE} _body: ${JSON.stringify(_body)} for ${req.url} (EC Internal API)`);

			    return reso({req:req,res:res,code:200,data:{glist:_gInfo,data:obj.data}});
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
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} err:${JSON.stringify(obj)} (EC External API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	});	
    }
}

module.exports=ECUserApi;
