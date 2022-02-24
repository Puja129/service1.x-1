/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSAuth = require("./../auth");
const RSCommon = require("./../common");
const ECAccountMgr = require("./../managers/account-mgr");
const PATH= require('path');
const URL = require('url')

const AUTH='Authorization';
const PX_ZONE='Predix-Zone-Id';

class ECAccountApi extends RSAuth {

    constructor(option,debug){
	super(option);
	this._debug=debug;
    }

    init(req,res){

	this._req=req;
	this._res=res;
	this._accMgr=new ECAccountMgr(this._options);
	
	try {
	    //zone-id
	    if (req.url.indexOf("/admin/accounts/list")>0)
		this._p = req.headers[PX_ZONE.toLowerCase()];
	    //validate account
	    else  if (req.url.indexOf("/admin/accounts/validate")>0)
		this._p = req.headers[PX_ZONE.toLowerCase()];
	    //add existing account
	    else if (req.url.indexOf("/add")>0){
		let ref=URL.parse(req.url).pathname.split("/");
		this._p = ref[4];
		this._qry_agtId = ref[6]||false;
	    }	
	    else {
		let ref=URL.parse(req.url).pathname.split("/");
		
		this._p = PATH.normalize(req.url).replace(/^(\.\.[\/\\])+/, '').replace("/"+process.env.BASE+"/admin/accounts/","");

	    }

	    debugger;

	    this._ci = (new Buffer(req.headers[AUTH.toLowerCase()].split(' ')[1], 'base64')).toString().split(':');
	}
	catch(e){
	    this._debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url}. e:${e} (EC Internal API)`);
	    return false;
	}

	return true;
    }
    
    updateAccount(){
	let _debug=this._debug, req=this._req, res=this._res,
	    acc=this._accMgr, _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{
	    
	    _debug(`${new Date()} EC: ${process.env.ZONE} received put request for ${req.url} (EC Internal API)`);

	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		let _chunk='',_body;

 		req.on('data',(chunk)=>{
		    _chunk+=chunk;
		});

		req.on('end', ()=>{
		    debugger;
		    try {
			_body=JSON.parse(_chunk);
			_debug(`${new Date()} EC: ${process.env.ZONE} _body: ${JSON.stringify(_body)} for ${req.url} (EC Internal API)`);
			
		    }
		    catch(e){
			debugger;
			_debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url} (EC Internal API)`);
			return reje({req:req,res:res,code:501});
		    }

		    let _sp=acc.UpdateAccount(_p,_body);
		    
		    if (!_sp){
			_debug(`${new Date()} EC: ${process.env.ZONE} account update failed for ${req.url} (EC Internal API)`);
			return reje({req:req,res:res,code:501, data:{status:"account update failed"}});
		    }
		    
		    return reso({req:req,res:res,code:201,data:{status: "account updated."}});
		    
		});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });
	    
	});
    }
    
    createAccount(){
	
	let _debug=this._debug, req=this._req, res=this._res,
	    acc=this._accMgr, _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{

	    _debug(`${new Date()} EC: ${process.env.ZONE} Received post request for ${req.url}. (EC Internal API)`);

	    debugger;

	    let _zon=_p;
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_zon).then(ok=>{

		//generate an id
		if (req.url.indexOf("/add")>0){
		    
		    let _ref=acc.CreateAccount(_zon,this._qry_agtId);
		    if (!_ref){
			return reje({req:req,res:res,code:501, data:{status:"account group creation failed, please verify the groupId/agentId."}});
		    }
			
		    return reso({req:req,res:res,code:201,data:{status: "account generated/added.",details:_ref}});		    
		}
		
		let _chunk='',_body;

		req.on('data',(chunk)=>{
		    _chunk+=chunk;
		});
		
		req.on('end', ()=>{
		    
		   /* no need for parsing chunck
		   debugger;
		    try {
			_body=JSON.parse(_chunk);
			_debug(`${new Date()} EC: ${process.env.ZONE} _body: ${JSON.stringify(_body)} for ${req.url} (EC Internal API)`);
			
		    }
		    catch(e){
			_debug(`${new Date()} EC: ${process.env.ZONE} Invalid json parsing for ${req.url} e:${e} (EC Internal API)`);
			return reje({req:req,res:res,code:501, err:e});
		    }*/

		    debugger;
		    
		    let _sp=acc.CreateAccountGroup(_zon);
		    
		    if (!_sp){
			_debug(`${new Date()} EC: ${process.env.ZONE} account creation failed for ${req.url} (EC Internal API)`);
			return reje({req:req,res:res,code:501, data:{status:"account group creation failed"}});
		    }

		    return reso({req:req,res:res,code:201,data:{status: "account group created."}});

		});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url}. Reason:${obj} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication',reason:obj}});			
	    });

	});
    }
    
    deleteAccount(){

	let _debug=this._debug, req=this._req, res=this._res,
	    acc=this._accMgr, _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{
	    _debug(`${new Date()} EC: ${process.env.ZONE} Received delete request for ${req.url} (EC Internal API)`);

	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{

		let _d=acc.DelAccount(_p.toString());

		if (!_d){
		    _debug(`${new Date()} EC: ${process.env.ZONE} delete account error for ${req.url} (EC Internal API)`);
		    return reje({req:req,res:res,code:501});
		}

		return reso({req:req,res:res,code:200,data:{status: "delete ok"}});    
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication'}});			
	    });

	});

    }

    getAccount(){
	let _debug=this._debug, req=this._req, res=this._res,
	    acc=this._accMgr, _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{

	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		
		let _s=acc.GetAccount(_p.toString());

		if (!_s){
		    _debug(`${new Date()} EC: ${process.env.ZONE} account does not exist for ${req.url} (EC Internal API)`);
		    return reje({req:req,res:res,code:501});
		}
		
		return reso({req:req,res:res,code:200,data:_s});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication',reason:obj}});
	    });
	});	
    }

    validateAccount(){
	let _debug=this._debug, req=this._req, res=this._res,
	    acc=this._accMgr, _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{

	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{

		let qry = URL.parse(req.url,true).query;

		let _s=acc.AccountValidation(qry.agtId1, qry.agtId2);

		if (!_s){
		    _debug(`${new Date()} EC: ${process.env.ZONE} accounts are not valid or not in a same group for ${req.url} (EC Internal API)`);
		    return reje({req:req,res:res,code:501});
		}
		
		return reso({req:req,res:res,code:200,data:_s});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication',reason:obj}});
	    });
	});	
    }

    getAccountList(){
	let _debug=this._debug, req=this._req, res=this._res,
	    acc=this._accMgr, _ci=this._ci, _p=this._p;

	return new Promise((reso,reje)=>{

	    _debug(`${new Date()} EC: ${process.env.ZONE} Received get request for ${req.url}. (EC Internal API)`);
	    //secure the call
	    return this.validate({clientType:'admin-api',id:_ci[0],secret:_ci[1]},_p).then(info=>{
		
		let _s=acc.GetGroupList();

		if (!_s){
		    _debug(`${new Date()} EC: ${process.env.ZONE} group info does not exist for ${req.url} (EC Internal API)`);
		    return reje({req:req,res:res,code:501});
		}
		
		return reso({req:req,res:res,code:200,data:_s});
		
	    }).catch((obj)=>{
		_debug(`${new Date()} EC: ${process.env.ZONE} authentication failed for ${req.url} (EC Internal API)`);
		return reso({req:req,res:res,code:404,data:{status:'failed authentication',reason:obj}});
	    });
	});	
    }
}

module.exports=ECAccountApi;
