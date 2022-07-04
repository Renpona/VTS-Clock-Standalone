const events = require('events');
const utils = require('../vts_modules/utils.js');
const Auth = require('../vts_modules/auth-browser.js');
const auth = new Auth();

const eventEmitter = new events.EventEmitter();
var vtsConnection = null;

function connect(port) {
    //var socket = new WebSocket("ws://0.0.0.0:" + port);
    var socket = new WebSocket("ws://localhost:" + port);

    // Connection opened
    socket.addEventListener('open', function (event) {
        //socket.send('Hello Server!');
        console.log("Connected to VTubeStudio on port " + port);
        let thumbnail = "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";
        socket.send(auth.checkForCredentials("Renpona", "Live2D Digital Display", thumbnail));
        vtsConnection = socket;
    });

    // Error
    socket.addEventListener('error', function (event) {
        connectionError(event);
    });

    socket.addEventListener('message', function (event) {
        //console.log('Received Message: ' + message.utf8Data);
        parseResponse(JSON.parse(event.data), socket);
    });

}

function connectionError(cause) {

}

function parseResponse(response, connection) {
    // Handle API Errors
    if (response.messageType == "APIError") {
        console.error(response.data);
        switch (response.data.errorID) {
            case 8: //RequestRequiresAuthetication 
            // Errors related to AuthenticationTokenRequest
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            // Errors related to AuthenticationRequest
            case 100:
            case 101:
            case 102:
                updateConnectionState(false, response.data.message);
                break;
            default:
                break;
        }
    }

    // Handle saving and sending Auth token
    if (!auth.token && response.messageType == "AuthenticationTokenResponse") {
        auth.token = response.data.authenticationToken;
        connection.send(auth.tokenAuth());
    }
    
    // Check for successful authentication
    else if (response.messageType == "AuthenticationResponse") {
        if (response.data.authenticated == true) {
            eventEmitter.emit("authComplete");
            updateConnectionState(true, "Connected and Authenticated to VTubeStudio!")
        } else {
            auth.invalidateToken();
            updateConnectionState(false, response.data.reason);
        }
    }

    // paying the price for never setting up a proper way to callback the stuff I send out
    else if (response.messageType == "HotkeysInCurrentModelResponse") {
        eventEmitter.emit("hotkeysLoaded", response.data.availableHotkeys);
    }
}

function sendRequest(request) {
    //console.log("SendRequest: ", request);
    vtsConnection.send(request);
}

function createNewParameter(paramName, explanation, min, max, defaultValue) {
    let request = utils.createNewParameter(paramName, explanation, min, max, defaultValue);
    //console.log("ParameterCreationRequest", request);
    vtsConnection.send(request);
}

function updateConnectionState(connected, message) {
    eventEmitter.emit("connectionState", connected, message);
};

export { eventEmitter, connect, parseResponse, createNewParameter, sendRequest }