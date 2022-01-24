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
        socket.send(auth.checkForCredentials("Renpona", "VTuber clock"));
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