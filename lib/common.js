/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const debug = require('debug');
const EventEmitter=require('events');
const request=require('request');
const FS = require('fs');
const { spawn } = require('child_process');

class ECCommon extends EventEmitter {

    constructor(options){
	super();
	this._request=request;

	//deprecated
	this._count=191000;

	this._options=options;
	    
	//deprecated
	//this._envs=(process.env.VCAP_APPLICATION&&JSON.parse(process.env.VCAP_APPLICATION));
    }

    cmd(cmd,args,env) {
	let _this=this,
	    _dbg=this._debug;
	    
	return new Promise((reso,reje)=>{	    
		
		const ls = spawn(cmd,args,env);

		ls.stdout.on('data', (data) => {
		  reso({stdout: `${data}`});
		});

		ls.stderr.on('data', (data) => {
		  reje({stderr: `${data}`});
		});

		ls.on('close', (code) => {
 		  _dbg(`${new Date()} EC: ${_this.options['info']['id']} child process (cmd) exited with code ${code}`);
		});
	});
    }
	
    debug(namespace){
	this._debug=debug(namespace);
	return this._debug;
    }

    randomString(size, chars){
	size = size || 6;
	chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let max = chars.length;
	let ret = '';
	for (let i = 0; i < size; i++) {
	    ret += chars.charAt(Math.floor(Math.random() * max));
	}
	return ret;
    }

    obj2Map(obj){
	if (obj.keys!=undefined)
	    return obj;
	
	let op=new Map();
	Object.keys(obj).forEach((key)=>{
	    op.set(key,obj[key]);
	});

	return op;
    }

    map2Obj(map){
	let _po={};
	for (var [key, value] of map) {
	    _po[key]=value;
	}
	return _po;

    }
	
/*
    serialiseObj(obj,path){
	return new Promise((reso,reje)=>{
	    
	    try{	
		process.env.EC_SETTINGS=JSON.stringify(obj)
		return reso(true);

		 no writing to local file per CF doc https://docs.cloudfoundry.org/devguide/deploy-apps/prepare-to-deploy.html
		   return FS.truncate(`${__dirname}/${path}`, 0,()=>{
		   process.env.EC_SETTINGS=JSON.stringify(obj)
		   FS.writeFile(`${__dirname}/${path}`,JSON.stringify(obj,null,4),()=>{
		   return reso(true);
		   });
		   });
	    }
	    catch(e){
		return reje(e);
	    }
	});
	    
    }

    deserialiseSettings(setvar){
	return new Promise((reso,reje)=>{

	    if (!process.env[setvar])
		return reje("EC_SETTINGS is not available.");
	    
	    try{
		debugger;
		let ref=JSON.parse(process.env.EC_SETTINGS);
		ref.groups=this.obj2Map(ref.groups);
		return reso(ref);
	    }
	    catch(e){
		return reje(e);

	    }
	     no reading from local file per CF doc https://docs.cloudfoundry.org/devguide/deploy-apps/prepare-to-deploy.html
	       return FS.readFile(`${__dirname}/${path}`,'utf8', (err,data)=>{
	       if (err) {
	       return reje(err);
	       }
	       let ref=JSON.parse(data);
	       ref.groups=this.obj2Map(ref.groups);
	       return reso(ref);
	       });
	});
	
    }
*/
    
    replaceStrInJsonFile(path,name,value){
	FS.readFile(`${__dirname}/${path}`,'utf8', (err,data)=> {
	    if (err) {
		return debug(`${new Date()} EC: ${process.env.ZONE} error reading ${path}. err: ${err}`);
	    }

	    let ref=JSON.parse(data);

	    for (let i = 0; i < name.length; i++) {
		ref[name[i]]=value[i];		
	    }

	    //let result = data.replace(frm,to);

	    FS.writeFile(`${__dirname}/${path}`, JSON.stringify(ref), 'utf8', (err)=> {
		if (err) {
		 return debug(`${new Date()} EC: ${process.env.ZONE} error writing ${path}. err: ${err}`);
		}
	    });
	});
    }

    escapeSpecialChars(str){
	return str.replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f");
    };
    
    //deprecated by chia
    decryptStringWithRsaPrivateKey(toDecrypt, PvtKeyBuff) {
	console.log(toDecrypt);
	console.log(PvtKeyBuff);
	//let buffer = new Buffer(toDecrypt, "base64"),
	let buffer = Buffer.from(toDecrypt,'base64'),
	    decrypted = crypto.privateDecrypt(PvtKeyBuff, buffer);
	
	return decrypted.toString("utf8");
    }

}

module.exports=ECCommon;
