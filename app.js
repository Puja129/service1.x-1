//does not work with select. need EC tunneling.
//require('newrelic');

var ECService=require('./ec-service');

/*
EC_SVC_ID
EC_SVC_URL
*/

var phs=new ECService({
    localPort:process.env.PORT || 8989,
    info: {
	    id: process.env.EC_SVC_ID,
	    url: process.env.EC_SVC_URL	    
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
	clientId: process.env.ZAC_CLIENT_ID,
	clientSecret: process.env.ZAC_CLIENT_SECRET,
	zacServiceId: process.env.ZAC_SERVICE_ID,
	zacUrl: process.env.ZAC_URL,
	authUrl:process.env.ZAC_UAA
    },
    'admin-api-auth':{
	type:'basic',
	id:process.env.ADMIN_USR||'admin',
	secret:process.env.ADMIN_PWD||'admin',
	token:process.env.ADMIN_TKN||'admin'
    },
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
