import { connect, eventEmitter } from './vts-script.js';
import { initClock, startClock } from './clock.js';

var connectionStatus = false;
initHandlers();

function initHandlers() {
    document.getElementById("connectBtn").addEventListener('click', () => connect(document.getElementById("portInput").value));
    document.getElementById("updateBtn").addEventListener('click', sendUpdatedValues);
    eventEmitter.on("connectionState", updateConnectionState);
    eventEmitter.once("authComplete", initClock);
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
            startClock("disable");
            break;
        case "clock":
            startClock("clock");
            break;
        case "timer":
            data.seconds = document.getElementById("timerSetting").value;
            data.direction = document.getElementById("timerStyle").value;
            startClock("timer", data);
            break;
        case "number":
            data.number = document.getElementById("inputVal").value;
            startClock("number", data);
            break;
        default:
            break;
    }
    
}