/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSCommon = require('./common');
const CRYPT_API='http://localhost:8990';
const EC_HEADER='ec-options';
const { spawn } = require('child_process');

class RSAuth extends RSCommon {

    constructor(options,debug){

	super(options);
	this._debug=debug;

    	this._options["ztoken"]={};

    }

    /*_getRefHash() {
	return new Promise((reso,reje)=>{	    
		
		const ls = spawn('agent', ['-hsh', '/usr']);

		ls.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		});

		ls.stderr.on('data', (data) => {
		  console.error(`stderr: ${data}`);
		});

		ls.on('close', (code) => {
		  console.log(`child process exited with code ${code}`);
		});
	});
    }*/
	
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
	
    //for predix only, config params details, auth details, payload
    _zacTokenValidation(c, a, f){
	
	return new Promise((reso,reje)=>{

	    //bypass the admin gateway validation
	    let _bypass=new Buffer(a.zoneId);
	    if (c.oauthToken==_bypass.toString('base64'))
	    	return reso({decision:'PERMIT'});
	    
	    debugger;
	    
	    this._oAuthTokenValidation(c, a, f).then(([b,a])=>{

		let body=b, _ep=`${a.zacUrl+a.zacServiceId}/${a.zoneId}`;

		debugger;
		
		let _op={
		    method: 'post',
		    url: _ep,
		    headers: {
			'Authorization': 'Bearer ' + body.access_token,
			'Content-Type': 'application/json'
		    },
		    json: {
			'encodedToken':c.oauthToken
		    }
		};
		
		debugger;
		
		this._request(_op,(err,res,_ref)=>{

		    debugger;

		    if (err){
			return reje(err);
		    }
		    
		    if (!_ref){
			return reje(`received an empty response from zac.`);
		    }

		    if (_ref.error||_ref.decision!='PERMIT'){
				
			return reje(_ref);
		    }    

		    this._debug(`${new Date()} EC: ${process.env.ZONE} the account# ${a.zoneId} is authenticated by zac with response: ${_ref}.`);
		    return reso(_ref);
		});	    

	    }).catch(err=>{
		
		return reje(err);
	    });
	});
    }

    _usageValidation(c){
	
	debugger;
	switch (c.clientType){
	case "client":
	case "server":
	case "gateway":
	case "admin":
	    return this._options['user-api-auth'];
	case "user-api":
	    return this._options['user-api-auth'];
	case "admin-api":
	    return this._options['admin-api-auth'];
	default:
	    return false;
	}
    }


    //verify the security groups
    _groupValidation(c,zone){

	if (zone){
	    debugger;
	    if (this._options.groups.has(zone)){
		return [zone, this._options.groups.get(zone)];
	    }
	    else 
		return false;
	}
	
	debugger;
	
	for (var [key, val] of this._options.groups) {
	    
	    if (val.ids.indexOf(c.id)!=-1&&val.ids.indexOf(c.targetServerId||c.id)!=-1){
		return [key,val];
	    }
	}

	return false;

    }

    //c: client conf, a: auth settings in gateway
    _basicValidation(c,a){	
	debugger;
	
	if (c.secret==a.token&&c.id==a.id)
	    return true;

	return false;
    }

    //c: client conf, a: auth settings in gateway
    _oAuthTokenValidation(c, a, f){
	
	
	let _dbg=this._debug;
	this._getAdmHash().then((out)=>{
	    _dbg(`${new Date()} EC: ${process.env.EC_SVC_ID} _getAdmHash > out: ${JSON.stringify(out)}`);
	});
	
        _dbg(`${new Date()} EC: ${process.env.EC_SVC_ID} _oAuthTokenValidation > a: ${JSON.stringify(a)}`);
	
	return new Promise((reso,reje)=>{
	    
	    let _buf=new Buffer(`${a.clientId}:${a.clientSecret}`);

	    let _op={
		method: 'post',
		url: a.authUrl,
		headers: {
		    'Authorization': 'Basic ' + _buf.toString('base64'),
		    'Content-Type': 'application/x-www-form-urlencoded'
		},
		form: f
	    };
	    
	    _dbg(`${new Date()} EC: ${process.env.EC_SVC_ID} _oAuthTokenValidation > _op: ${JSON.stringify(_op)}`);
		
	    debugger;

	    this._request(_op,(err,res,body)=>{
		debugger;
		let _body;
		
		try{
		    _body=JSON.parse(body);
		}
		catch(e){
		    return reje(e);
		}
		
		if (_body.error){
		    return reje(_body.error);
		}

		this._debug(`${new Date()} EC: ${process.env.ZONE} oauth ${a.type} validation call has been authenticated by client: ${a.clientId}.`);

		debugger;
		return reso([_body,a]);
	    });	    
	});	
    }

    //not a public api
    DecryptMsg(msg, usr, tkn){

	return new Promise((reso,reje)=>{
	    let _buf=new Buffer(`${usr}:${tkn}`);

	    let _op={
		method: 'get',
		url: CRYPT_API+"/decrypt",
		headers: {
		    'Authorization': 'Basic ' + _buf.toString('base64'),
		    'Content-Type': 'application/json',
		}
	    };
	    _op.headers[EC_HEADER]=msg
	    
	    debugger;
	    
	    this._request(_op,(err,res,body)=>{
		debugger;
		let _body;
		
		try{
		    console.log(body);
		    _body=JSON.parse(body);
		}
		catch(e){
		    return reje(e);
		}
		
		if (_body.error){
		    return reje(_body.error);
		}

		debugger;
		return reso(_body);
	    });	    

	});

    }

    /*
     * clientType: "auth/oauth2/basic/plain"
     * id
     * secret
     * autoToken
     */
    validate(conf,zone){
	return new Promise((reso,reje)=>{

	    //get auth info
	    let _op=this._usageValidation(conf);

	    debugger;
	    if (!_op)
		return reje(`connection from ${conf.id} rejected due to the unknown client.`);
	    
	    debugger;
	    
	    if (conf.clientType!='admin-api'&&!(_op.zone=this._groupValidation(conf,zone))){
		
		return reje(`connection rejected due to the invalid group. conf: ${JSON.stringify(conf)} zone: ${JSON.stringify(zone)}`);
	    }

	    debugger;

	    _op.zoneId=(_op.zone&&_op.zone[0])||zone;

	    debugger;

	    switch (_op.type){
	    case "oauth2":
	    case "oauth":    
		return this._oAuthTokenValidation(conf, _op, {'token':c.oauthToken}).then(body=>{
		    return reso(body);
		}).catch(err=>{
		    return reje(err);
		});
	    case "zac":
		return this._zacTokenValidation(conf, _op,{'client_id':_op.clientId,'grant_type':'client_credentials'}).then(body=>{
		    return reso(body);
		}).catch(err=>{
		    return reje(err);
		});
	    case "basic":
	    case "plain":
		debugger;
		if (!this._basicValidation(conf,_op))
		    return reje(`connection from ${conf.id} rejected due to the invalid credential.`);

		debugger;
		return reso(true);
		
	    default:
		
		return reje(false);
	    }
	});	
    }

}

module.exports=RSAuth;
