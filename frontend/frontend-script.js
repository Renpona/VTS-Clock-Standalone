const utils = require('../vts_modules/utils');
import { connect, eventEmitter } from './vts-script.js';
import { initClock, startClock, timerClear, timerRestart, timerStop, hotkeyList, loadHotkeys, storeHotkeys, storeAlarmValue } from './clock.js';

var connectionStatus = false;
initHandlers();

function initHandlers() {
    document.getElementById("modeSelect").addEventListener('input', controlsController);
    document.getElementById("connectionHelp").addEventListener('click', (event) => { 
        event.preventDefault();
        document.getElementById("connectionHelpSection").classList.toggle("hidden");
    });

    document.getElementById("timerPause").addEventListener('click', () => {
        document.getElementById("timerResume").style.display = "block";
        document.getElementById("timerPause").style.display = "none";
        displayMode("timer (paused)");
        timerStop();
    });
    document.getElementById("timerResume").addEventListener('click', () => {
        document.getElementById("timerResume").style.display = "none";
        document.getElementById("timerPause").style.display = "block";
        displayMode("timer");
        timerRestart();
    });
    document.getElementById("timerClear").addEventListener('click', () => {
        document.getElementById("timerResume").style.display = "none";
        document.getElementById("timerPause").style.display = "none";
        document.getElementById("timerClear").style.display = "none";
        displayMode("disabled");
        detailedStatus("");
        timerClear();
    });
    
    //connection handlers
    document.getElementById("connectBtn").addEventListener('click', () => connect(document.getElementById("portInput").value));
    document.getElementById("updateBtn").addEventListener('click', sendUpdatedValues);
    eventEmitter.on("connectionState", updateConnectionState);

    //clock handlers
    eventEmitter.once("authComplete", initClock);

    //alarm handlers
    document.getElementById("alarmHotkeyList").addEventListener('input', setAlarm);
    eventEmitter.on("hotkeysLoaded", storeHotkeys);
    eventEmitter.on("hotkeysLoaded", initHotkeyList);
    eventEmitter.once("authComplete", loadHotkeys);

    controlsController();
    displayMode("disable");
}

//
//  UTILITY FUNCTIONS
//
function transitionShow(element) {
    element.classList.toggle("hidden");
}

// add success/error colors to important messages
function colorText(element, success) {
    element.classList.remove("success", "error");
    if (success == true) element.classList.add("success");
    else element.classList.add("error");
}

function detailedStatus(message) {
    document.getElementById("detailedStatus").textContent = message;
}

//
//     MAIN CODE
//

function updateConnectionState(connected, message) {
    connectionStatus = connected;
    let statusElement = document.getElementById("connectionState");
    statusElement.textContent = message;
    if (connected == true) colorText(statusElement, true);
    else colorText(statusElement, false);
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
            document.getElementById("timerPause").style.display = "block";
            document.getElementById("timerClear").style.display = "block";
            document.getElementById("timerResume").style.display = "none";
            break;
        case "number":
            data.number = document.getElementById("inputVal").value;
            startClock("number", data);
            break;
        default:
            break;
    }
    displayMode(mode);
    
}

function displayMode(value) {
    if (value == "disable") value = "inactive";
    document.getElementById("modeStatus").textContent = value;
}

function controlsController() {
    let value = document.getElementById("modeSelect").value;
    let controls = document.querySelectorAll(".controls > div");
    controls.forEach((currentValue) => {
        if (currentValue.id == value) {
            currentValue.hidden = false;
        } else if (value == "timer" && currentValue.id == "alarm") {
            currentValue.hidden = false;
        } else {
            currentValue.hidden = true;
        }
    });
}

function initHotkeyList() {
    //TODO: add ability to wipe and refresh list
    if (hotkeyList) {
        let select = document.getElementById("alarmHotkeyList");
        hotkeyList.forEach(hotkey => {
            let id = hotkey.hotkeyID;
            let option = new Option(utils.hotkeyNamer(hotkey), id);
            select.add(option);
        });
    } else {
        console.error("hotkeyList storage empty");
    }
}

//this is really more like "update alarm". sends the new alarm value to the clock code
function setAlarm() {
    let hotkeyId = document.getElementById("alarmHotkeyList").value;
    storeAlarmValue(hotkeyId);
}

export { detailedStatus }