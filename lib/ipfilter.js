/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSCommon = require('./common');
const nip = require('ip');

class RSIPFilter extends RSCommon {

    constructor(options){
	
	super(options);
	this._options=options;
	
    }
    
    isInWhiteList(sip,cid){

	try{
	    sip=sip.split(',');

	    debugger;
	    
	    for (let ip of sip){

		debugger;
		//granted if the ip's in a private network
		if (nip.isPrivate(ip.trim()))
		    return true;
		
		debugger;
		let _ref=this._options.clients[cid]||this._options.servers[cid];

		_ref=_ref.whiteList;
		
		for (var val in _ref) {

		    debugger;
		    //console.log('val:',_ref[val]);
		    let _cidr=nip.cidrSubnet(_ref[val]);

		    if (_cidr.contains(ip.trim())) {
			return true;
		    }
		}

	    }
	    
	    return false;
	}
	catch (ex){
	    this._debug(`${new Date} ${process.env.ZONE} whitelist error format: ${sip}. err: ${ex}`);
	    return false;
	}

    }

    //ip,id
    isInBlockList(ip,cid){
	debugger;
	let _ref=this._options.clients[cid]||this._options.servers[cid];
	//console.log('_ref',_ref);
	if (!_ref)
	    return true;

	return _ref.blockList.indexOf(ip)>-1;
	
    }
}

module.exports=RSIPFilter;

