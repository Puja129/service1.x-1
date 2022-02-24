# Enterprise Connect Predix Service API/Gateway
 - 任意のクラウドコンピューティング環境のためのノードのTCPトンネリングのPoCライブラリ。

## ゴール
- Predixより良いのIoT PaaSのようにします。
- 顧客にPredixで管理可能でスケーラブルなのIoTサービスを提供しています。

##Features
- HTTP/WebSocket compatible.
- Support all streaming/non-streaming TCP protocols. (ICMP, SSH, FPT, sFPT, etc.)
- Bi-Directional streaming.
- Support Multi-session/tenant feat.
- Support server-side Proxy-forwarding.
- Client Basic Authentication.

##Work in progress
- Moderator/Handshake Server. Bridge resources from across multiple clients.
- Implement calls via Secure-channels (wss, https). Support self-signed .cert,.der,.pem from OpenSSL.
- Generate prt/pub keys without OpenSSL.
- RSA Handshake model. Support SHA1 and MD5 on both pvt/pub keys.

## Installation

<pre>
git clone #git-repo #path
cd #path
npm install
</pre>

## Usage

###client
<pre>
var PHClient=require('./ph-client');
//port# 7999 is making the websocket call to amazon. the remote address is assigned to amazon with the remote port 3001
var phs=new PHClient({
    localPort:7999,
    serviceHost:'ec2-54-88-81-181.compute-1.amazonaws.com',
    //serviceHost:'localhost',
    servicePort:3001,
    clientId: 'ClientId-A',
    clientSecret: '1234',
    cert: '2323r23r34hhhH(*HOUou4on34',
    'ssl-cert': 'xxwewr34t34t34t'
});
</pre>

###server
<pre>

var PHServer=require('./ph-server');

//localPort 9898 represents the listener on the amazon host whereas remoteAddress/remotePort indicate the destination of the forwarding 
var phs=new PHServer({
    localPort:9898,
    clients: {
	'ClientId-A':{
	    secret: '1234',
	    cert: 'werergwgv451y1',
	    remoteHost: 'localhost',
	    remotePort:5432,
	    auth: 'SSL'
	},
	'ClientId-B':{
	    secret: '143434',
	    cert: 'werw34tf34gou3hgvoi3jg5oij35gij3',
	    remoteHost: '3.39.108.121',
	    remotePort: 21,
	    auth: 'Basic'
	}
});
//command: DEBUG=ph:server node ph-server

</pre>

###environment variables DEBUG

####client
DEBUG=ph:client

####server
DEBUG=ph:server


##Reference

####Github:

#####Original (Contact Prasad/Chia for access)
https://github.build.ge.com/212359746/ph-tcp-tunnel

#####Mirrored
https://github.build.ge.com/200018017/ph-tcp-tunnel-1

####Design/Prototype:
https://github.build.ge.com/212359746/ph-tcp-tunnel/blob/master/docs/poc-tcp-tunneling.pptx?raw=true

####Demo:

#####MongoDB
https://predix-cs-portal.run.asv-pr.ice.predix.io/mongo/listcats (List rows)

https://predix-cs-portal.run.asv-pr.ice.predix.io/mongo/addcat/:name/:type (Add row)

#####PostgresSQL
https://predix-cs-portal.run.asv-pr.ice.predix.io/pg/listbirds (List rows)

https://predix-cs-portal.run.asv-pr.ice.predix.io/mongo/addbird/:name/:type (Add row)
