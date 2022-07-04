const utils = require('./utils.js');

function getHotkeysList(modelId) {
    let request;
    if (modelId) {
        let data = {
            "modelId": modelId
        }
        request = utils.buildRequest("HotkeysInCurrentModelRequest", data);
    } else {
        request = utils.buildRequest("HotkeysInCurrentModelRequest");
    }
    return request;
}

function activateHotkey(hotkeyId) {
    let data = {
        "hotkeyID": hotkeyId
    };
    let request = utils.buildRequest("HotkeyTriggerRequest", data);
    return request;
}

export { getHotkeysList, activateHotkey }