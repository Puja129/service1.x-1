//does not work with select. need EC tunneling.
//require('newrelic');

var ECService=require('./ec-service');

var phs=new ECService({
    localPort:process.env.PORT || 8989,
    info: {
	    id: process.env.EC_SVC_ID,
	    url: process.env.EC_SVC_URL,
	    legacy_setting: process.env.EC_SETTING,
	    legacy_adm_tkn: process.env.EC_ADM_TKN,
	    cid: process.env.EC_CID,
	    csc: process.env.EC_CSC,
	    pxy_ver: "v1.2beta"
    },
    
    //deprecated
    reporting:{
	vendor: 'nurego',
	//endpoint: process.env.NUREGO_ENDPOINT+'/usages?api_key={apiKey}',
	endpoint: process.env.NUREGO_ENDPOINT+'/usages',
	featureId: process.env.NUREGO_FEATURE_ID,
	usageFeatureId: process.env.NUREGO_USAGE_FEATURE_ID,
	apiKey: process.env.NUREGO_API_KEY,
	tokenURL: process.env.NUREGO_TKN_URL,
	tokenUserName: process.env.NUREGO_TKN_USR,
	tokenPassword: process.env.NUREGO_TKN_PWD,
	tokenInstId: process.env.NUREGO_TKN_INS
    },
    'user-api-auth':{
	type:'zac',
	//clientId: process.env.EC_CID,
	//clientSecret: process.env.EC_CSC,
	//duplicate to EC_SVC_ID    
	//zacServiceId: process.env.ZAC_SERVICE_ID,
	zacUrl: `${process.env.EC_SAC_URL}/v1.2beta/ec/proc/${process.env.EC_SCRIPT_3}`,
	authUrl: `${process.env.EC_ATH_URL}/oauth/token`
    },
    'admin-api-auth':{
	type:'basic',
	id:'admin',
	secret:process.env.EC_ADM_TKN||'admin',
	//token:btoa(process.env.ADMIN_TKN||'admin'
    	//token:process.env.EC_ADM_TKN
    },
    //deprecated
    _ssl:{
	key:'./cert/rs-key.pem',
	cert:'./cert/rs-cert.pem'
    },
    groups: {},
    keepAlive: 20000
});

phs.once('service_listening',()=>{
});

const exec = require('child_process').exec;
exec(__dirname+'/api_linux', (e, stdout, stderr)=> {
    if (e instanceof Error) {
        console.error(e);
        throw e;
    }
    console.log('stdout ', stdout);
    console.log('stderr ', stderr);
});

//command: DEBUG=rs:gateway node gateway
