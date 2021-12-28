const utils = require('./utils.js');
const fs = require('fs');
const fsPromise = require('fs/promises');

class Auth {
    constructor() {
        this.token = null;
        this.appName = null;
        this.devName = null;
        this.tokenSaved = false;
    }
    checkForCredentials(name, developer) {
        this.appName = name;
        this.devName = developer;
        if (fs.existsSync("clock-token.txt")) {
            this.tokenSaved = true;
            let tokenFile = fs.readFileSync("clock-token.txt", 'utf8');
            this.token = tokenFile;
            return this.tokenAuth();
        } else {
            return this.requestToken(name, developer);
        }
    }
    requestToken(name, developer) {
        this.appName = name;
        this.devName = developer;
        let data = {
            "pluginName": this.appName,
            "pluginDeveloper": this.devName,
        };
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
            fsPromise.writeFile("clock-token.txt", this.token).then(() => this.tokenSaved = true);
        }
        return request;
    }
    //TODO: Add ability to save token locally so that it doesn't have to be re-approved every time
}

module.exports = Auth;