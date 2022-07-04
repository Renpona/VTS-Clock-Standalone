const utils = require('./utils.js');

class Auth {
    constructor() {
        this.token = null;
        this.appName = null;
        this.devName = null;
        this.tokenSaved = false;
        this.storageName = "";
    }
    checkForCredentials(name, developer, thumbnail = null) {
        this.appName = name;
        this.devName = developer;
        this.storageName = "VTS " + this.appName;
        if (localStorage.getItem(this.storageName)) {
            this.tokenSaved = true;
            this.token = localStorage.getItem(this.storageName);
            return this.tokenAuth();
        } else {
            return this.requestToken(name, developer, thumbnail);
        }
    }
    requestToken(name, developer, thumbnail) {
        this.appName = name;
        this.devName = developer;
        let data = {
            "pluginName": this.appName,
            "pluginDeveloper": this.devName,
        };
        if (thumbnail) {
            data.pluginIcon = thumbnail;
        }
        let request = utils.buildRequest("AuthenticationTokenRequest", data);
        console.log("Sent Message: " + request)
        return request;
    }
    tokenAuth() {
        let data = {
            "pluginName": this.appName,
            "pluginDeveloper": this.devName,
            "authenticationToken": this.token
        };
        let request = utils.buildRequest("AuthenticationRequest", data);
        console.log("Sent Message: " + request);
        if (this.tokenSaved == false) {
            localStorage.setItem(this.storageName, this.token);
        }
        return request;
    }
    invalidateToken() {
        localStorage.removeItem(this.storageName);
        this.tokenSaved = false;
    }
}

module.exports = Auth;