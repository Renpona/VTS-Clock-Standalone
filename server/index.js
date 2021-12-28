const events = require('events');
const Net = require('net');
const { parse } = require('path');
const utils = require('../vts_modules/utils');
const vtsConnection = require('../vts_modules/vtsConnector');

vtsConnection.eventEmitter.once("authComplete", startClock);
vtsConnection.connect();

var timeKeeper;

var currDisplay = {
    "Digit1": 0,
    "Digit2": 0,
    "Digit3": 0,
    "Digit4": 0,
    "separator": 1
};
const clockParams = ["separator", "Digit1", "Digit2", "Digit3", "Digit4"];

function startClock() {
    //TODO: check if params already exist, and if so, skip creating them
    //Create parameters used for controlling clock
    createParams();

    let mode = "";
    let inputNumber;
    let inputObject;

    /**
     * Clock mode: use command line parameter "clock"
     * Timer mode: use command line parameter "timer", followed by time in seconds and then direction
     * Number mode: use command line parameter "number", followed by the number
     */
    if (process.argv.length > 2) {
        let argument = process.argv[2];
        if (argument == "clock") mode = "clock";
        else if (argument == "timer") {
            inputNumber = process.argv[3];
            var direction = process.argv[4];
        } else if (argument == "number") {
            inputNumber = process.argv[3];
            inputObject = parseNumberToObject(inputNumber, false);
        }
        mode = argument;
        

        
    }
    
    //TODO: remove test data
    let testData = {
        "Digit1": -1,
        "Digit2": 6,
        "Digit3": 6,
        "Digit4": 6,
        "separator": 0
    }
    //inputObject = testData;

    //test number display
    //parseNumberToParams(testData);

    switch (mode) {
        case "number":
            timeKeeper = setInterval(parseObjectToParams, 800, inputObject);
            break;
        case "timer":
            let startTime = Date.now();
            //let inputNumber = 30;
            timeKeeper = setInterval(timer, 200, inputNumber, startTime, direction);
            break;
        case "clock":
            setInterval(realTimeClock, 800);
            break;
        default:
            setInterval(realTimeClock, 800);
            break;
    }
}

function createParams() {
    vtsConnection.createNewParameter(clockParams[1], "clock digit", -1, 9, 0);
    vtsConnection.createNewParameter(clockParams[2], "clock digit", -1, 9, 0);
    vtsConnection.createNewParameter(clockParams[3], "clock digit", -1, 9, 0);
    vtsConnection.createNewParameter(clockParams[4], "clock digit", -1, 9, 0);
    vtsConnection.createNewParameter(clockParams[0], "clock colon", 0, 1, 1);
}

function realTimeClock() {
    let time = new Date();
    let hourData = parseHours(time);
    let minuteData = parseMinutes(time);
    Object.assign(hourData, minuteData);
    parseObjectToParams(hourData);
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
    } else if (minute <= 9 && minute > 0) {
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
    
    console.log(remainingTime);
    if (remainingTime < 1) {
        clearInterval(timeKeeper);
        process.exit(0);
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
    parseObjectToParams(timeString);
}

function parseNumberToObject(inputNumber, separator) {
    let outputObject = {};
    inputNumber.padStart(4, '0');
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
    for (i = 0; i < clockParams.length; i++) {
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
    return vtsConnection.createParamValue(param, value);
}

function sendNumberRequest(paramArray) {
    let request = utils.buildRequest("InjectParameterDataRequest", {"parameterValues": paramArray});
    vtsConnection.sendRequest(request);
}
