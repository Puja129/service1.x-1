/*
 * author: apolo.yasuda@ge.com
 */

'use strict';

const RSCommon = require('./common');

class RSSession extends RSCommon {

    constructor(options){
	super(options);

	this._sockets=new Map();
	this._pool=[];//new Map();
	this.adm_sockets=new Map();
	
    }
        
    getAvailableSessionByServerId(cid, bid){	

	debugger;

	for (var [key, val] of this._sockets.entries()) {

	    debugger;
	    
	    if (val.serverOptions.id.indexOf(cid)>-1&&val.bindId==bid){

		if (val.client==null){
		    debugger;
		    return key;
		}
	    }
	}

	return false;

    }
    
    DeleteAllSessions(){
	for (var [key, val] of this._sockets) {	    
	    this.DeleteASession(key);
	}
    }

    GetASessionDetails(sid){
	return this._sockets.get(sid);
    }

    GetAllSessionIds(){
	return this._sockets.keys();
    }
    
    generateSessionId() {
	return Date.now() + '.' + this.randomString(5);
    }
    
    generateBindId() {
	return Date.now() + '.' + this.randomString(5);
    }
    
    DeleteASession(sid){

	let socket=this._sockets.get(sid);

	if (!socket)
	    return;
	
	//client.
	socket.client&&socket.client.close&&socket.client.close();

	socket.server&&socket.server.close&&socket.server.close();
	
	process.nextTick(() => {
	    this._sockets.delete(sid);

	    this._debug(`${new Date} session ${sid} has been deleted.`);
	    this.emit('session_delete',sid);
	});
    }

    pipe(source, dest, sid){

	debugger;
	const addr = (source.address?source.address():(source.socket.address&&source.socket.address()));
	let bytes_rs = 0, bytes_ws = 0, _debug=this._debug;

	//websocket only
	source.on('message', (msg)=> {

	    debugger;
	    bytes_ws += msg.binaryData.length;
	    
	    if (dest.writable){
		dest&&dest.write&&dest.write(msg.binaryData);
	    }
	    else {
		dest&&dest.sendBytes&&dest.sendBytes(msg.binaryData);
	    }
	    process.nextTick(() => {
		bytes_ws += msg.binaryData.length;
		//_debug(`${new Date} transmitting websocket data from the gateway: ${msg.binaryData.length} bytes (total=${bytes_ws}) websocket{${addr.address}:${addr.port}}`);
	    })

	});

	source.once('error', (err) => {
	    _debug(`${new Date()} EC: ${process.env.ZONE} connection ${addr.address}:${addr.port} error: ${err}`);

	    process.nextTick(() => {
	
		this.emit('connect_error', err, source);
	    });

	    this.DeleteASession(sid);
	});

	source.once('close', _ => {
	    _debug(`${new Date()} EC: ${process.env.ZONE} connection ${addr.address}:${addr.port} closed.`);
	    process.nextTick(() => {
		this.emit('connect_close', source);
	    });
	    
	    this.DeleteASession(sid);
	});

	source.on('end', _ => {
	    _debug(`${new Date()} EC: ${process.env.ZONE} socket ended at total ${bytes_rs} bytes for connection ${addr.address}:${addr.port}.`);
	});
	
    }
    
    pipeTwoWay(a, b, s){
	debugger;
	this.pipe(a, b, s);
	this.pipe(b, a, s);
    }

}

module.exports=RSSession;
