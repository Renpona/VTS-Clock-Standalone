const utils = require('../vts_modules/utils');
const Auth = require('../vts_modules/auth-browser.js');
const auth = new Auth();

function connect(port) {
    var socket = new WebSocket("ws://0.0.0.0:" + port);

    // Connection opened
    socket.addEventListener('open', function (event) {
        //socket.send('Hello Server!');
        console.log("Connected to VTubeStudio on port " + port);
        socket.send(auth.checkForCredentials("Renpona", "VTuber clock"));
    });

    // Error
    socket.addEventListener('error', function (event) {
        connectionError(event);
    });

    socket.addEventListener('message', function (event) {
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
            parseResponse(JSON.parse(message.utf8Data), socket);
        }
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