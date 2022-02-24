var RSGateway=require('./../rs-gateway');
var NR;

var phs=new RSGateway({
    localPort:process.env.PORT || 8989,
    reporting:{
	vendor: 'nurego',
	endpoint: 'https://am-staging.nurego.com/v1/subscriptions/{serviceInst}/entitlements/usage?api_key={apiKey}',
	featureId: process.env.NUREGO_FEATURE_ID,
	apiKey: process.env.NUREGO_API_KEY
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
	secret:process.env.ADMIN_PWD||'admin'
    },
    _ssl:{
	key:'./cert/rs-key.pem',
	cert:'./cert/rs-cert.pem'
    },
    clients: {},
    servers: {},
    groups: {},
    keepAlive: 20000
});

phs.once('gateway_listening',()=>{
    NR=require('../newrelic');
});

//command: DEBUG=rs:gateway node gateway
