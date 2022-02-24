'use strict';
(function(){
    
    Polymer({
	is: 'ec-step1',
	handleAddZone:function(e){
	    if (e.keyCode===13){
		var elm=Polymer.dom(this.root).querySelector('#inputForValidation');
		this.zone=elm.value;

		if (window.location.href.indexOf('localhost')>-1){
		    this.memoryUrl="http://localhost:8989/v1/health/memory";
		    return;
		}
		
		var op=window.location.href.split(".");
		op.shift();
		
		var s=op[op.length-1];
		s=s.substr(0,s.indexOf('/'));
		op.pop();
		op.push(s);
		this.memoryUrl='https://'+this.zone+'.'+op.join('.')+'/v1/health/memory';
	    }
	},
	_submit:(e)=>{
	    console.log(e);
	},
	properties:{
	    memoryUrl:String,
	    zone:String
	},
	ready:function(){
	}
    });

    
})();
