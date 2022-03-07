/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

//const UTIL = require('util');
//const mime = require('mime');
const ECHealthApi = require("./api/healthApi");
const ECAccountApi = require("./api/accountApi");
const ECReportingApi = require('./api/reportingApi');
const ECUserApi = require('./api/userApi');
const ECSecurityApi = require('./api/securityApi');
const ECStaticApi = require('./api/staticApi');
const ECAuth = require('./auth');
const ECAcc = require('./managers/account-mgr');

const ECCommon = require('./common');

class ECApi extends ECCommon {

    constructor(options){
	super(options);

	this._options.reporting['usage']={
	    data:[]
	}

	this._options.reporting['obj']={}

	setInterval(()=>{
	    this._debug(`${new Date()} EC: ${process.env.ZONE} beginning hourly batch reporting.`);
            
	    //temp discarded	
	    return;
	    
	    this.reporting()
		.then((body)=>{
		    this._options.reporting['usage'].data=[];
		    this._options.reporting["obj"]={};
		})
		.catch(err=>{
		    this._debug(`${new Date()} EC: ${process.env.ZONE} reporting error. err: ${err}`);
		});
	}, 1000*60*60);
    }

    //nurego
    usageCalc(){
	const _rep=this._options.reporting;

	for (let feature in _rep.obj){

	    let obj={
		"subscription_id": process.env.ZONE,
		"provider": "cloud-foundry",
		"feature_id": feature,
		"amount": _rep.obj[feature],
		"usage_date": (new Date()).getTime(),
		"id": "1"
	    };
	    
	    if (feature=='data_usage')
		obj['unit_of_measure']='Byte';

	   _rep.usage.data.push(obj);

	}
	
	//report only when accumulating too many entries.
	/*if (this._options.reporting.usage.data.length>900) {

	    this.reporting()
		.then((body)=>{
		    this._options.reporting['usage'].data=[];
		})
		.catch(err=>{
		    this._debug(`${new Date()} EC: ${process.env.ZONE} reporting error. err: ${err}`);
		});
	    
	    return;
	}*/
    }

    //nurego
    reporting(){

	return new Promise((reso,reje)=>{

	    this.getReportToken()
		.then(_tkn=>{

		    this.usageCalc();
		    
		    const _rep=this._options.reporting;
		    //let _ep=_rep.endpoint.replace('{apiKey}',_rep.apiKey);
		    let _ep=_rep.endpoint;

		    _rep.usage.count=_rep.usage.data.length;
		    _rep.usage.object='list';
		    
		    let _op={
			headers:{
			    'Content-Type':'application/json',
			    'Authorization':'bearer '+_tkn
			},
			method: 'post',
			url: _ep,
			json:true,
			body:_rep.usage
		    };
		    
		    debugger;

		    this._debug(`${new Date()} EC: ${process.env.ZONE} _op:${JSON.stringify(_op)}`);
		    
		    this._request(_op,(err,res,body)=>{
			debugger;

			if (err||res.statusCode>210){
			    this._debug(`${new Date()} EC: ${process.env.ZONE} body:${JSON.stringify(body)}`);
			    return reje(body);
			}

			this._debug(`${new Date()} EC: ${process.env.ZONE} has been successfully reported in nurego.`);
			debugger;
			return reso(body);
		    });
		})
		.catch(err=>{
		    this._debug(`${new Date()} EC: ${process.env.ZONE} reporting error. err: ${err}`);
		});
	 
	});	
    }

    getReportToken(){
	return new Promise((reso,reje)=>{
	    
	    const _rep=this._options.reporting;

	    let _op={
		headers:{
		    'Content-Type':'application/json'
		},
		method: 'post',
		url: _rep.tokenURL,
		json:true,
		body:{
		    username: _rep.tokenUserName,
		    password: _rep.tokenPassword,
		    "instance_id": _rep.tokenInstId
		}
	    };

	    console.log(_op.body);

	    this._request(_op,(err,res,body)=>{
		if (err||res.statusCode>210){
		    this._debug(`${new Date()} EC: ${process.env.ZONE} body:${JSON.stringify(body)}`);
		    return reje(body);
		}

		this._debug(`${new Date()} EC: ${process.env.ZONE} has successfully fetched the reporting token for nurego.`);

		reso(body.access_token);
	    });
	    
	});
    }
    
    addNewUsage(feature='api_calls',amount=1){

	amount=amount||0;
	
	let op=(this._options.reporting.obj[feature]||0);

	op+=amount;
	
	this._options.reporting.obj[feature]=op;
	//console.log(this._options.reporting.obj);

	//report only when accumulating too many entries.
	/*
	  if (this._options.reporting.usage.data.length>900) {

	    this.reporting()
		.then((body)=>{
		    this._options.reporting['usage'].data=[];
		})
		.catch(err=>{
		    this._debug(`${new Date()} EC: ${process.env.ZONE} reporting error. err: ${err}`);
		});
	    
	    return;
	}
	*/
    }

    getCFOAuthToken(){
	let auth=new ECAuth(this._options,this._debug),
	    usr=process.env.CF_USR,
	    pwd=process.env.CF_PWD,
	    lgn=process.env.CF_LOGIN;

	debugger;
	return auth._oAuthTokenValidation({},
				   {
				       authUrl:lgn,
				       clientId:"cf",
				       clientSecret:""
				   },
				   {
				       grant_type:"password",
				       client_id:"cf",
				       username:usr,
				       password:pwd
				   }).then(([b,a])=>{
				       return b.access_token;
				   });

    }

    setAppSettings(){

	let acc=new ECAcc(this._options),
	    fs = require('fs');
	    
	fs.writeFileSync(`./../svcs/${this._options['info']['id']}.json`, JSON.stringify(acc.GetGroupsDetail(), null, 2), 'utf-8');

	//deprecated
	/*let _tk='';
	return this.getCFOAuthToken().then(tk=>{
	    _tk=tk;
	    debugger;
	    return this.getCFEnvVariables(tk);
	}).then(env=>{
	    debugger;
	    let acc=new ECAcc(this._options),
		//ad=JSON.stringify(acc.GetAccount(env.ZONE));
	        ad=JSON.stringify(acc.GetGroupsDetail());

	    debugger;
	    env.EC_SETTINGS=new Buffer(ad).toString('base64');
	    return this.setCFEnvVariables("environment_json",env,_tk);
	});*/
    }

    setCFEnvVariables(_ky,_va, _tkn){
	
	return new Promise((reso,reje)=>{
	    let _api=process.env.CF_API,
		vcap=JSON.parse(process.env.VCAP_APPLICATION),
		_path=`${_api}/v2/apps/${vcap.application_id}`,
		_d={};

	    _d[_ky]=_va;
	    
	    let _op={
		headers:{
		    'Authorization':'bearer '+_tkn
		},
		method: 'put',
		url: _path,
		json:true,
		body:_d
	    };

	    debugger;
	    this._request(_op,(err,res,body)=>{

		if (err||res.statusCode>210){
		    this._debug(`${new Date()} EC: ${process.env.ZONE} body:${JSON.stringify(body)}`);
		    return reje(body);
		}
		
		return reso(body["entity"]["environment_json"]);
	    });
	    
	});
    }

    getCFEnvVariables(_tkn){
	return new Promise((reso,reje)=>{
	    let _api=process.env.CF_API,
		vcap=JSON.parse(process.env.VCAP_APPLICATION),
		_path=`${_api}/v2/apps/${vcap.application_id}/env`,
		_op={
		    headers:{
			'Content-Type':'application/json',
			'Authorization':'bearer '+_tkn
		    },
		    method: 'get',
		    url: _path,
		    json:true
		};
	    debugger;
	    this._request(_op,(err,res,body)=>{

		debugger;
		if (err||res.statusCode>210){
		    this._debug(`${new Date()} EC: ${process.env.ZONE} body:${JSON.stringify(body)}`);
		    return reje(body);
		}
		
		return reso(body["environment_json"]);
	    });
	    
	});
	
    }
        
    hook(req,res){
	
	let _debug=this._debug,
	    _dbg=this._debug, _this=this;

	debugger;
	
	return new Promise((reso,reje)=>{		

	    //get settings at user level
	    /* deprecate for potential security leak
	    if (req.url===("/"+process.env.BASE+"/api/settings")){
		
		let user=new ECUserApi(this._options,this._debug);
		
		if (!user.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		switch (req.method.toLowerCase()){
		case "get":
		    return user.getSettings().then(obj=>{
		    	this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });

		default:
		    _debug(`${new Date()} EC: ${process.env.ZONE} Unsupported request for ${req.url} (EC API)`);
		    return reso({req:req,res:res,code:401});
		}

		return;
	    }
	    */
	    if (req.url===("/"+_this._options["info"]["pxy_ver"])){
	       const serverSocket = net.connect(80, "www.google.com", () => {
            
	          serverSocket.pipe(req.req.socket);
	          req.socket.pipe(serverSocket);
	        });

	        serverSocket.on('end', () => {
		  return reso({res:res,data:"proxy called",code:200});
		});
	       //_dbg(`${new Date()} EC: ${_this._options['info']['id']}. /${_this._options["info"]["pxy_ver"]} called.`);	    
	       //return reso({res:res,data:"proxy called",code:200});
	    }

	    //token validation
	    if (req.url===("/"+process.env.BASE+"/api/token/validate")){

		//_dbg(`${new Date()} EC: ${_this._options['info']['id']} /api/token/validate called.`);
		
		let user=new ECUserApi(_this._options,_dbg);
		
		//_dbg(`${new Date()} EC: ${_this._options['info']['id']} user: ${user} _this._options: ${JSON.stringify(_this._options)}`);
		//return reso({});
		//try {
		if (!user.init(req,res)) {
		    //_dbg(`${new Date()} EC: ${_this._options['info']['id']} user.init failed.`);
		    return reje('user.init failed.');	    
		}

		//_dbg(`${new Date()} EC: ${_this._options['info']['id']} user.init called.`);
		//return reso({});
		    
		switch (req.method.toLowerCase()){
		case "post":
		    return user.tokenValidate().then(obj=>{
		    	this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}

		return reje('unsupported method');
	    }

	    //get the list of active gateways
	    if (req.url===("/"+process.env.BASE+"/api/gateways")){

		let user=new ECUserApi(this._options,this._debug);
		
		if (!user.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		switch (req.method.toLowerCase()){
		case "post":
		    return user.xchangeGatewayList().then(obj=>{
		    	this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}

		return;
	    }

	    //for user to retrieve the public key
	    if (req.url===("/"+process.env.BASE+"/api/pubkey")){

		let user=new ECUserApi(this._options,this._debug);
		
		if (!user.init(req,res)) {
		    return reje('failed user.init');	    
		}

		switch (req.method.toLowerCase()){
		case "get":
		    return user.getPublicKey().then(obj=>{
		    	this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}

		return;
	    }

	    //health APIs
	    if (req.url===("/"+process.env.BASE+"/health/check")){
	
		let health=new ECHealthApi(this._options,this._debug);
		
		if (!health.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		return health.checkStatus().then(obj=>{
		    this.addNewUsage();
		    return reso(obj);
		}).catch((err)=>{
		    return reje(err);
		});
	    }
		
	    if (req.url===("/"+process.env.BASE+"/health/memory")){
		
		let health=new ECHealthApi(this._options,this._debug);
		    
		//_debug(`${new Date()} EC: ${_this._options['info']['id']} checkMemory called`);
		    
		if (!health.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		//_debug(`${new Date()} EC: ${_this._options['info']['id']} health.init called`); 
		return health.checkMemory().then(obj=>{
		    //_debug(`${new Date()} EC: ${_this._options['info']['id']} checkMemory passed`); 
		
		    this.addNewUsage();
		    return reso(obj);
		}).catch((err)=>{
		    return reje(err);
		});
	    }

	    //reporting APIs
	    if (req.url.indexOf("/"+process.env.BASE+"/reports/usage")===0){

		let report=new ECReportingApi(this._options,this._debug);
		    
		if (!report.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		switch (req.method.toLowerCase()){
		case "post":
		    return report.reportUsage().then(obj=>{
			if (obj.code==200){
			    console.log("obj.data.lastUsage",obj.data.lastUsage);
			    this.addNewUsage('data_usage',obj.data.lastUsage);
			}
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		    
		case "get":
		    return report.getUnreportedUsage().then(obj=>{
			this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}

	    }

	    //security APIs
	    if (req.url.indexOf("/"+process.env.BASE+"/certs/csr")===0){

		let security=new ECSecurityApi(this._options,this._debug);
		
		if (!security.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		switch (req.method.toLowerCase()){

		case "post":
		    return security.submitCSR().then(obj=>{
			this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		    
		case "get":
		    return security.getCSR().then(obj=>{
			this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}

	    }

	    //security APIs
	    if (req.url.indexOf("/"+process.env.BASE+"/certs/service")===0){

		let security=new ECSecurityApi(this._options,this._debug);
		
		if (!security.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}
		
		switch (req.method.toLowerCase()){

		case "get":
		    return security.getPublicKey().then(obj=>{
			this.addNewUsage();
			return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}
	    }

	    
	    //account query APIs
	    if (req.url.indexOf("/"+process.env.BASE+"/admin/accounts/validate")===0){
		
		let acc=new ECAccountApi(this._options,this._debug);
		
		if (!acc.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		debugger;
		switch (req.method.toLowerCase()){

		case "get":
		    return acc.validateAccount().then((obj)=>{
			this.addNewUsage();
			 return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}
	    }
	    
	    //admin APIs
	    if (req.url.indexOf("/"+process.env.BASE+"/admin/accounts/list")===0){
		
		let acc=new ECAccountApi(this._options,this._debug);
		
		if (!acc.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}

		debugger;
		switch (req.method.toLowerCase()){

		case "get":
		    return acc.getAccountList().then((obj)=>{
			this.addNewUsage();
			 return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		}
	    }
	    
	    //admin APIs
	    if (req.url.indexOf("/"+process.env.BASE+"/admin/accounts/")===0){
		
		let acc=new ECAccountApi(this._options,this._debug);
		
		if (!acc.init(req,res)) {
		    return reje({req:req,res:res,code:501});	    
		}
		
		debugger;
		switch (req.method.toLowerCase()){

		case "put":
		    return acc.updateAccount().then((obj)=>{
			this.addNewUsage();
			return this.setAppSettings().then(ent=>{
			    return reso(obj);
			});
			
		    }).catch((err)=>{
			return reje(err);
		    });
		    
	    	case "post":
		    return acc.createAccount().then((obj)=>{
			debugger;
			this.addNewUsage();
			return this.setAppSettings().then(ent=>{
			    return reso(obj);
			});
		    }).catch((err)=>{
			return reje(err);
		    });
		    
		case "get":
		    return acc.getAccount().then((obj)=>{
			this.addNewUsage();
			 return reso(obj);
		    }).catch((err)=>{
			return reje(err);
		    });
		    
		case "delete":
		    return acc.deleteAccount().then((obj)=>{
			this.addNewUsage();
			return this.setAppSettings().then(ent=>{
			    return reso(obj);
			});
		    }).catch((err)=>{
			return reje(err);
		    });
		}
	    }

	    
	    //public revision info
	    if (req.url.indexOf("/"+process.env.BASE+"/info/")===0&&
		req.method.toLowerCase()==="get"){

		let sfile=new ECStaticApi(this._options,this._debug);
		
		if (!sfile.init(req,res)) {
		    return reje({req:req,res:res,code:501,data:'static api failed whilst initialising.'});	    
		}

		return sfile.getRevision().then((obj)=>{
		    return reso(obj);
		}).catch((err)=>{
		    return reje(err);
		});
	    }

	    //static resources
	    if (req.url.indexOf("/"+process.env.BASE+"/index/")===0&&
		req.method.toLowerCase()==="get"){

		let sfile=new ECStaticApi(this._options,this._debug);
		
		if (!sfile.init(req,res)) {
		    return reje({req:req,res:res,code:501,data:'static data failed in initialising.'});	    
		}

		return sfile.getUI().then((obj)=>{
		    return reso(obj);
		}).catch((err)=>{
		    return reje(err);
		});

	    }
	    
	    //static default
	    if (req.url==="/"&&
		req.method.toLowerCase()==="get"){
		res.writeHead(301,{Location: "/ui/"});
		return reso({req:req,res:res,code:301});
	    }

	    //static ui
	    if (req.url.indexOf("/ui/")===0&&
		req.method.toLowerCase()==="get"){
				let sfile=new ECStaticApi(this._options,this._debug);
		
		if (!sfile.init(req,res)) {
		    return reje({req:req,res:res,code:501,data:'static data failed in initialising'});	    
		}

		return sfile.getAsset().then((obj)=>{
		    return reso(obj);
		}).catch((err)=>{
		    return reje(err);
		});
	    }

	    _debug(`${new Date()} EC: ${process.env.ZONE} Received request for ${req.url} but service failed to pick up.`);
	    return reje({req:req,res:res,code:404});
	});
    };

}

module.exports=ECApi;
