const basicInfo = {
    "apiName": "VTubeStudioPublicAPI",
    "apiVersion": "1.0",
    "requestID": "testID"
}

function buildRequest(type, data, requestId = "testId") { 
    let request = basicInfo;
    request.messageType = type;
    request.requestID = requestId;
    request.data = data;
    let returnValue = JSON.stringify(request);
    //console.log(returnValue);
    return returnValue;
}

function createNewParameter(paramName, explanation, min, max, defaultValue) {
    let data = {
        "parameterName": paramName,
        "explanation": explanation,
        "min": min,
        "max": max,
        "defaultValue": defaultValue
    };
    return buildRequest("ParameterCreationRequest", data);
}

function createParamValue(id, value, weight = null) {
    let param = {
        "id": id,
        "value": value
    }
    if (weight) param.weight = weight;
    return param;
}

//exports.buildRequest = buildRequest;
module.exports = {
    buildRequest: buildRequest,
    createNewParameter: createNewParameter,
    createParamValue: createParamValue
}