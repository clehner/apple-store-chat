if(!Array.prototype.forEach)Array.prototype.forEach=function(c,d){if(this===void 0||this===null)throw new TypeError;var b=Object(this),e=b.length>>>0;if(typeof c!=="function")throw new TypeError;for(var a=0;a<e;a++)a in b&&c.call(d,b[a],a,b)};

function $(id) {
	return document.getElementById(id);
}

var apiKey = 'sr1DFCvn2e83VRmK';

var storesMenu, accountsList;

var stores = window.stores;
var accounts = [];
var protocol = 'ichat';

function init() {
	storesMenu = $("stores");
	accountsList = $("accounts");
	
	populateStoresMenu(stores);
	
	$("form").onsubmit = function () {
		refreshAccountsList(storesMenu.value);
		return false;
	};
	
	$("protocol").onchange = function () {
		protocol = this.value;
		rewriteLinks();
	};
	
	storesMenu.onchange = function () {
		if (this.value == "other") {
			askForOther();
		}
	};
}

// manual entry of store number in menu.
function askForOther() {
	var id = prompt('Enter a 3-digit store number.');
	if (!id) return;
	addOption(storesMenu, id, id).selected = true;
}

var protocols = {
	'aim': 'aim:goim?screenname=',
	'ichat': 'ichat:compose?service=AIM&id='
};
function makeChatLink(sn) {
	return protocols[protocol] + sn;
}

function rewriteLinks() {
	accounts.forEach(function (account) {
		account.updateLink();
	});
}

function addOption(menu, value, text) {
	var option = document.createElement("option");
	option.value = value;
	option.innerHTML = text;
	menu.appendChild(option);
	return option;
}

function addOptgroup(menu, label) {
	var optgroup = document.createElement("optgroup");
	optgroup.setAttribute("label", label);
	menu.appendChild(optgroup);
	return optgroup;
}

function populateStoresMenu(stores) {
	// group stores by country
	var storesByCountry = {};
	stores.forEach(function (store) {
		(storesByCountry[store.country] || (storesByCountry[store.country] = [])).push(store);
	});
	
	for (var country in storesByCountry) {
		var optgroup = addOptgroup(storesMenu, country);
		var stores = storesByCountry[country];
		stores.forEach(function (store) {
			if (!store.name) return;
			var id = store.id.substr(1);
			//var name = store.city + (store.state ? ', ' + store.state:'') + ' - ' + store.name;
			var name = (store.state ? store.state + ' - ':'') + store.city + ' - ' + store.name;
			var option = addOption(optgroup, id, name);
			if (id == '095') option.selected = true;
		});
	}
	addOption(storesMenu, "other", "Other&hellip;");
}

function clearAccountsList() {
	accounts = [];
	accountsList.innerHTML = "";
}

function refreshAccountsList(storeId) {
	clearAccountsList();
	for (var i = 1; i < 100; i++) {
		new Account(storeId, i).add(accounts, accountsList);
	}
}

function padNumber(n, digits) {
	return ('0000' + n).substr(-digits);
}

function jsonp(url, cb) {
	var script = document.createElement("script");
	var callbackName = 'jsonp_' + Math.random().toString(16).substr(2);
	window[callbackName] = function (result) {
		delete window[callbackName];
		cb(result);
	};
	script.src = url + callbackName;
	document.documentElement.firstChild.appendChild(script);
}

function Account(store, account) {
	this.sn = 'ars' + store + '.' + padNumber(account, 2) + '@mac.com';
	this.li = document.createElement("li");
	this.a = document.createElement("a");
	this.icon = document.createElement("img");
	this.a.appendChild(this.icon);
	//this.a.appendChild(document.createTextNode(this.sn));
	this.li.title = this.sn;
	this.li.appendChild(this.a);
	this.getPresence();
}
Account.prototype = {
	add: function(array, list) {
		array.push(this);
		list.appendChild(this.li);
	},
	getPresence: function () {
		var self = this;
		jsonp('http://api.oscar.aol.com/presence/get?k=' + apiKey +
				'&f=json&t=' + this.sn + '&c=', function (result) {
			self.gotPresence(result.response.data.users[0]);
		});
	},
	gotPresence: function (presence) {
		this.online = (presence.state == 'online');
		var icon = presence.buddyIcon;
		this.li.className = this.online ? 'online' : '';
		if (icon) this.icon.src = icon;
		this.updateLink();
	},
	updateLink: function () {
		if (this.online) this.a.setAttribute('href', makeChatLink(this.sn));
		else this.a.removeAttribute('href');
	}
}