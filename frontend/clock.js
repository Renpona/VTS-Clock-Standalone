const utils = require('../vts_modules/utils');
import { createNewParameter, eventEmitter, sendRequest } from './vts-script.js';
import { detailedStatus } from './frontend-script.js';
import { getHotkeysList, activateHotkey } from '../vts_modules/hotkeys.js';


var timeKeeper; // Stores the setInterval used to keep the clock running

var timerStopFlag = false;
var timerStatus;

var currDisplay = {
    "Digit1": 0,
    "Digit2": 0,
    "Digit3": 0,
    "Digit4": 0,
    "separator": 1
};
const clockParams = ["separator", "Digit1", "Digit2", "Digit3", "Digit4"];

var hotkeyList;
var alarmHotkeyId;

function initClock() {
    createParams();
    eventEmitter.on("alarm", triggerAlarm);
}

function startClock(mode, data) {
    clearInterval(timeKeeper);

    let inputTime;
    let inputObject;

    if (mode == "timer") {
        inputTime = data.seconds;
        var direction = data.direction;
    } else if (mode == "number") {
        inputTime = data.number;
        detailedStatus(data.number);
        inputObject = parseNumberToObject(inputTime, false);
    }
    
    switch (mode) {
        case "number":
            timeKeeper = setInterval(setNumber, 800, inputObject);
            break;
        case "timer":
            timerStatus = null;
            timerStopFlag = false;
            let startTime = Date.now();
            timeKeeper = setInterval(timer, 200, inputTime, startTime, direction);
            break;
        case "clock":
            timeKeeper = setInterval(realTimeClock, 800);
            break;
        case "disable":
        default:
            break;
    }
}

function createParams() {
    createNewParameter(clockParams[1], "clock digit", -1, 9, 0);
    createNewParameter(clockParams[2], "clock digit", -1, 9, 0);
    createNewParameter(clockParams[3], "clock digit", -1, 9, 0);
    createNewParameter(clockParams[4], "clock digit", -1, 9, 0);
    createNewParameter(clockParams[0], "clock colon", 0, 1, 1);
}

function realTimeClock() {
    let time = new Date();
    let hourData = parseHours(time);
    let minuteData = parseMinutes(time);
    Object.assign(hourData, minuteData);
    parseObjectToParams(hourData);
    detailedStatus(`${hourData.Digit1}${hourData.Digit2}:${minuteData.Digit3}${minuteData.Digit4}`);
}

function parseHours(time) {
    let data = {};
    let hour = time.getHours();
    if (hour <= 29 && hour > 19) {
        data.Digit2 = hour - 20;
        data.Digit1 = 2;
    } else if (hour <= 19 && hour > 9) {
        data.Digit2 = hour - 10;
        data.Digit1 = 1;
    } else if (hour <= 9 && hour >= 0) {
        data.Digit2 = hour;
        data.Digit1 = 0;
    } else {
        console.error("weird shit happened");
    }
    return data;
}

function parseMinutes(time) {
    let data = {};
    let minute = time.getMinutes();

    if (minute <= 59 && minute > 49) {
        data.Digit4 = minute - 50;
        data.Digit3 = 5;
    } else if (minute <= 49 && minute > 39) {
        data.Digit4 = minute - 40;
        data.Digit3 = 4;
    } else if (minute <= 39 && minute > 29) {
        data.Digit4 = minute - 30;
        data.Digit3 = 3;
    } else if (minute <= 29 && minute > 19) {
        data.Digit4 = minute - 20;
        data.Digit3 = 2;
    } else if (minute <= 19 && minute > 9) {
        data.Digit4 = minute - 10;
        data.Digit3 = 1;
    } else if (minute <= 9 && minute >= 0) {
        data.Digit4 = minute;
        data.Digit3 = 0;
    } else {
        console.error("weird shit happened");
    }
    return data;
}

function timer(inputTime, startTime, direction = "down") {
    //startTime is milliseconds
    //inputTime is seconds, convert to milliseconds
    let currentTime = Date.now();
    inputTime = inputTime * 1000;
    let timeElapsed = currentTime - startTime;
    let remainingTime = inputTime - timeElapsed;
    
    //console.log(remainingTime);
    if (remainingTime < 1) {
        clearInterval(timeKeeper);
        eventEmitter.emit("alarm", alarmHotkeyId);
    }
    if (direction == "up") {
        remainingTime = Math.floor(timeElapsed / 1000);
    } else {
        remainingTime = Math.floor(remainingTime / 1000);
    }
   
    //convert to seconds
    let minuteSecondValue = remainingTime / 60;
    //console.log(minuteSecondValue);
    let minutes = Math.floor(minuteSecondValue).toString().padStart(2, '0');
    let seconds = Math.floor((minuteSecondValue - minutes) * 60).toString().padStart(2, '0');

    let timeString = parseNumberToObject(minutes.toString().concat(seconds), true);
    if (minuteSecondValue >= 0) {
        parseObjectToParams(timeString);
        detailedStatus(`${minutes}:${seconds}`);
    }
    if (timerStopFlag == true) {
        clearInterval(timeKeeper);
        timerStatus = {
            time: remainingTime,
            direction: direction
        };
        timerStopFlag = false;
        timeKeeper = setInterval(setNumber, 800, parseNumberToObject(remainingTime.toString(), true));
    }
}

function timerStop() {
    timerStopFlag = true;
}

function timerRestart() {
    timerStopFlag = false;
    clearInterval(timeKeeper);
    if (timerStatus) {
        let startTime = Date.now();
        timeKeeper = setInterval(timer, 200, timerStatus.time, startTime, timerStatus.direction);
        timerStatus = null;
    }
    else {
        console.warn("Tried to restart the timer, but there was no paused timer data!");
    }
}

function timerClear() {
    timerStatus = null;
    timerStopFlag = false;
    clearInterval(timeKeeper);
}

function setNumber(inputObject) {
    parseObjectToParams(inputObject);
}

function parseNumberToObject(inputNumber, separator) {
    let outputObject = {};
    inputNumber = inputNumber.padStart(4, '0');
    for (let i = 0; i < 4; i++) {
        let digit = i + 1;
        outputObject["Digit" + digit] = inputNumber.charAt(i);
    }
    if (separator === true) {
        outputObject.separator = 1;
    } else {
        outputObject.separator = 0;
    }
    return outputObject;
}

function parseObjectToParams(data) {
    let paramArray = [];
    for (let i = 0; i < clockParams.length; i++) {
        let currParam = clockParams[i];
        if (data[currParam] || data[currParam] == 0) {
            paramArray.push(sendSingleNumber(currParam, data[currParam]));
            currDisplay[currParam] = data[currParam];
        } else {
            paramArray.push(sendSingleNumber(currParam, currDisplay[currParam]));
        }
    }
    sendNumberRequest(paramArray);
}

function sendSingleNumber(param, value) {
    return utils.createParamValue(param, value);
}

function sendNumberRequest(paramArray) {
    let request = utils.buildRequest("InjectParameterDataRequest", {"parameterValues": paramArray});
    sendRequest(request);
}

// ALARMS
function loadHotkeys() {
    let request = getHotkeysList(null);
    sendRequest(request);
}

function storeHotkeys(hotkeys) {
    hotkeyList = hotkeys;
}

function clearHotkeys() {
    hotkeyList = null;
}

function storeAlarmValue(hotkeyId) {
    alarmHotkeyId = hotkeyId;
}

function triggerAlarm() {
    if (alarmHotkeyId != "none") {
        let request = activateHotkey(alarmHotkeyId);
        sendRequest(request);
    }
    //console.log(`Alarm trigger with hotkeyId ${alarmHotkeyId}`);
}

export { initClock, startClock, timerStop, timerRestart, timerClear, hotkeyList, loadHotkeys, storeHotkeys, clearHotkeys, storeAlarmValue, triggerAlarm }