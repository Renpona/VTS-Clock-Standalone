/**
 * NOT USED
 * This is an entry point for connecting to VTubeStudio in a Node-based application. Not used in this project, but left in as an example.
 */

const events = require('events');
const WebSocketClient = require('websocket').client;
const utils = require('./utils');
const Auth = require('./auth');
const auth = new Auth();

const eventEmitter = new events.EventEmitter();

const wsClient = new WebSocketClient();
const vtsPort = 8001;
var vtsConnection;

wsClient.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

wsClient.on('connect', function (connection) {
    vtsConnection = connection;
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('Connection Closed');
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
            parseResponse(JSON.parse(message.utf8Data), connection);
        }
    });
    //connection.send(auth.requestToken("Renpona", "VTuber clock"));
    connection.send(auth.checkForCredentials("Renpona", "VTuber clock"));
});

function parseResponse(response, connection) {
    if (!auth.token) {
        auth.token = response.data.authenticationToken;
        connection.send(auth.tokenAuth());
    }
    //console.log(response.data);
    else if (response.messageType == "AuthenticationResponse" && response.data.authenticated == true) {
        eventEmitter.emit("authComplete");
        console.log(response.data);
    }
}

function sendRequest(request) {
    //console.log("SendRequest: ", request);
    vtsConnection.send(request);
}

/* TODO:
    Shuffle off most of these request builders to a separate file
    The artmesh IDs should be read from a JSON file or something instead of hardcoded like this
    Probably should also put the game-specific stuff in a separate file
    This will probably be part of a larger project-wide code reorganization necessary for user customization support
*/
class Colors {
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

function recolorMesh(color, mesh, rainbow = false, tintAll = false) {
    let data = {
        "colorTint": {
            "colorR": color.red,
            "colorG": color.green,
            "colorB": color.blue,
            "colorA": color.alpha
        }
    }
    if (tintAll == true) {
        data.artMeshMatcher = {"tintAll": tintAll};
    } else {
        data.artMeshMatcher = {"nameExact": mesh};
    }
    if (rainbow == true) data.colorTint.jeb_ = true;
    
    let request = utils.buildRequest("ColorTintRequest", data);
    vtsConnection.send(request);
}

class MoveResizeRotate {
    constructor(time = 0.5, relative = false) {
        this.timeInSeconds = time;
        this.valuesAreRelativeToModel = relative;
    }
    move(x, y) {
        this.positionX = x;
        this.positionY = y;
    }
    resize(size) {
        this.size = size;
    }
    rotate(rotation) {
        this.rotation = rotation;
    }
    send() {
        let request = utils.buildRequest("MoveModelRequest", this);
        vtsConnection.send(request);
    }
}

function runHotkey(hotkeyId) {
    let data = {
        "hotkeyID": hotkeyId
    }
    let request = utils.buildRequest("HotkeyTriggerRequest", data);
    vtsConnection.send(request);
}

// MOVED TO UTILS
function createParamValue(id, value, weight = null) {
    let param = {
        "id": id,
        "value": value
    }
    if (weight) param.weight = weight;
    return param;
}

function clearAnimation(target) {
    console.log("animation flag cleared");
    target.animating = false;
}

function createNewParameter(paramName, explanation, min, max, defaultValue) {
    let request = utils.createNewParameter(paramName, explanation, min, max, defaultValue);
    console.log("ParameterCreationRequest", request);
    vtsConnection.send(request);
}

function connectToVts() {
    wsClient.connect('ws://localhost:' + vtsPort);
}

module.exports = {
    eventEmitter: eventEmitter,
    connection: vtsConnection,
    runHotkey: runHotkey,
    createNewParameter: createNewParameter,
    createParamValue: createParamValue,
    connect: connectToVts,
    sendRequest: sendRequest
};
