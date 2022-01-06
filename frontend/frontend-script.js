const { connect } = require("../vts_modules/vtsConnector");

var connectionStatus;

function initHandlers() {
    let port = document.getElementById("portInput").textContent;
    document.getElementById("connectBtn").addEventListener('click', () => connect(port));
    document.getElementById("updateBtn").addEventListener('click', sendUpdatedValues);
}

function updateConnectionState(connected, message) {
    connectionStatus = connected;
    document.getElementById("connectionState").textContent = message;
}

function sendUpdatedValues() {
    let mode = document.getElementById("modeSelect").value;
    let data = {};
    switch (mode) {
        case "disable":
            break;
        case "clock":
            break;
        case "timer":
            data.seconds = document.getElementById("timerSetting");
            data.direction = document.getElementById("timerStyle");
            break;
        case "number":
            data.number = document.getElementById("inputVal");
            break;
        default:
            break;
    }
    
}