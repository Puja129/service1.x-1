
(function(){
    'use strict';
    
    Polymer({
	is: 'ec-step0',
	properties: {
            page: {
		type: String,
		reflectToAttribute: true,
		observer: '_pageChanged'
            }
	},

	observers: [
            '_routePageChanged(routeData.page)'
	],

	_routePageChanged: function(page) {
	    console.log(page);
            this.page = page||'ec-step1';
	},

	_pageChanged: function(page) {
	    page=(page=='ui'?'ec-step1':page);
	    console.log(page);
            let _p=page + '.html';
            var resolvedPageUrl = this.resolveUrl(_p);
            this.importHref(resolvedPageUrl, null, this._showPage404, true);
	},

	_showPage404: function() {
            this.page = 'view404';
	}
    });
    /*
      document.addEventListener('WebComponentsReady', function () {
      var template = document.querySelector('template[is="dom-bind"]');
      template.selected = 0; 
      });*/
});
