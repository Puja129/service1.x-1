/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const ECCommon = require("./../common");
const FS = require("fs");
const PATH = require("path");

class RSAccountMgr extends ECCommon {

    constructor(options){

	super(options);

    }

    GetNextAvailableAccount(){
	
	return this.randomString(6);
	/*
	this._options.groups.forEach((val, key) => {
	    let _grp=this._options.groups.get(key);
	    while (_grp.ids.indexOf(aid.toString())>-1) {
		aid=(this.randomString(6,'0123456789')==aid?);
	    }
	});
	
	return aid.toString();
	*/
    };

    UpdateAccount(zoneId,settings){

	debugger;
	if (!settings['trustedIssuerIds'])
	    return {status:'failed to update trustedIssuerIds.'};

	debugger;

	let _grp=this._options.groups.get(zoneId);

	if (!_grp)
	    return {status:'failed to find the group.'};

	_grp['trustedIssuerIds']=settings['trustedIssuerIds'];

	return _grp;
    };

    InitAccounts(_zon,settings){

	for (var zon in settings) {
	    if (settings.hasOwnProperty(zon)) {
		
		let _st=settings[zon];

		let ids=[];
		if (!_st['ids']){
		    ids.push(this.GetNextAvailableAccount());
		    ids.push(this.GetNextAvailableAccount());
		}
		else
		    ids=_st['ids'];
		
		let _grp={ids:ids};
		
		if (_st['trustedIssuerIds'])
		    _grp['trustedIssuerIds']=_st['trustedIssuerIds'];
		
		this._options.groups.set(zon,_grp);
	    }
	}
	
	return this.GetGroupsDetail();
    };

    CreateAccountGroup(zon){

	let _grp=this._options.groups.get(zon);

	if (_grp)
	    return _grp;

	let ids=[];
	ids.push(this.GetNextAvailableAccount());
	ids.push(this.GetNextAvailableAccount());
	
	_grp={ids:ids};
	
	this._options.groups.set(zon,_grp);
	
	return this.GetGroupsDetail();
    };

    CreateAccount(zoneId,agtId){

	console.log('zoneId',zoneId);
	console.log('agtId',agtId);

	let _grp=this._options.groups.get(zoneId);

	if (!_grp)
	    return false;

	let aid=agtId;
	if (!aid){
	    aid=this.GetNextAvailableAccount();
	} else {
	    if (!this.AgentValidation(aid)||
	        _grp.ids.indexOf(aid)>-1){
		return false;
	    }

	    this.DelAgent(aid);
	}
	
	_grp.ids.push(aid);

	return this.GetAccount(zoneId);
    };

    GetGroupList(){

	let keys=[];
	
	try {
	    let ref=this.GetGroupsDetail();

	    for (var _ref in ref) keys.push(_ref);
	}
	catch (e) {
	    return {status:`failed for the reason: ${e}`}
	}
	
	return {groups: keys};
    }

    GetGroupsDetail(){
	return this.map2Obj(this._options.groups);
    }
    
    GetAccount(zoneId){

	try {
	    let  _grp=this._options.groups.get(zoneId);
	    
	    if (!_grp)
		return null;

	    //if ADMIN_TKN had been registered in the CF ENV
	    if (process.env['ADMIN_TKN']){
		
		let _buf=new Buffer(`admin:${process.env['ADMIN_TKN']}`);
		//_grp['adm_tkn']=_buf.toString('base64');
		let op=JSON.parse(process.env.VCAP_APPLICATION);
		//_grp['sid']=op['application_name'];
	    }
	    
	    return _grp;
	}
	catch (e){
	    console.log(e);
	}

	return null;	
    };

    DelAccount(zoneId){

	this._options.groups.delete(zoneId);
	this._debug(`${new Date()} EC: ${process.env.ZONE} account ${zoneId} has been deleted.`)
	
    };

    DelAgent(agt){
	
	try {
	    let ref=this.GetGroupsDetail();

	    for (let _ref in ref){
		let _ids=ref[_ref].ids,
		    _idx_agt=_ids.indexOf(agt);
		if (_idx_agt>-1){
		    _ids.splice(_idx_agt, 1);
		}
	    }
	    
	    return false;
	}
	catch (e) {
	    console.log(e);
	}
	
	return false;
    }

    AgentValidation(agt){

	try {
	    let ref=this.GetGroupsDetail();

	    for (let _ref in ref){
		let _ids=ref[_ref].ids;
		if (_ids.indexOf(agt)>-1){
		    return true; 
		}
	    }

	    return false;
	}
	catch (e) {
	    console.log(e);
	}
	
	return false;
    }

    AccountValidation(agt1, agt2){

	//agtIds cannot duplicate
	if (agt1==agt2)
	    return false;
	
	let grps=[];
	try {
	    let ref=this.GetGroupsDetail();

	    for (let _ref in ref){
		let _ids=ref[_ref].ids;
		if (_ids.indexOf(agt1)>-1&&
		    _ids.indexOf(agt2)>-1){
		    grps.push(_ref); 
		}
	    }

	    return {groupIds:grps};
	}
	catch (e) {
	    console.log(e);
	}
	
	return false;
    }
}

module.exports=RSAccountMgr;
