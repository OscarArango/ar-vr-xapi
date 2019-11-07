/****************  Declare Variables  ****************/
var TC_COURSE_ID, TC_COURSE_NAME, TC_COURSE_DESC, TC_RECORD_STORES;
var TCAPI_STATUS = "",
    TCAPI_STATUS_CHANGED = false,
    TCAPI_SCORE = {},
    TCAPI_COMPLETION_STATUS = "",
    TCAPI_SATISFACTION_STATUS = null,
    TCAPI_UPDATES_PENDING = false,
    TCAPI_IN_PROGRESS = false,
    TCAPI_NO_ERROR = "",
    TCAPI_VERB_COMPLETED = "completed",
    TCAPI_VERB_EXPERIENCED = "experienced",
    TCAPI_VERB_ATTEMPTED = "attempted",
    TCAPI_VERB_ANSWERED = "answered",
    TCAPI_VERB_PASSED = "passed",
    TCAPI_VERB_FAILED = "failed",
    TCAPI_INIT_VERB = TCAPI_VERB_ATTEMPTED,
    TCAPI_INTERACTION = "http://adlnet.gov/expapi/activities/cmi.interaction",
    TCAPI_INTERACTION_TYPE_TRUE_FALSE = "true-false",
    TCAPI_INTERACTION_TYPE_CHOICE = "choice",
    TCAPI_INTERACTION_TYPE_FILL_IN = "fill-in",
    TCAPI_INTERACTION_TYPE_MATCHING = "matching",
    TCAPI_INTERACTION_TYPE_PERFORMANCE = "performance",
    TCAPI_INTERACTION_TYPE_SEQUENCING = "sequencing",
    TCAPI_INTERACTION_TYPE_LIKERT = "likert",
    TCAPI_INTERACTION_TYPE_NUMERIC = "numeric",
    TCAPI_STATE_BOOKMARK = "bookmark",
    TCAPI_STATE_TOTAL_TIME = "cumulative_time",
    TCAPI_STATE_SUSPEND_DATA = "suspend_data",
    TCAPI_ERROR_INVALID_PREFERENCE = 0,
    TCAPI_ERROR_INVALID_TIMESPAN = 1,
    TCAPI_FUNC_NOOP = function () {},
    intTCAPIError,
    strTCAPIErrorString,
    strTCAPIErrorDiagnostic;
var tincan;
var tcapi_cache;
var NO_ERROR = 0;
var EXIT_TYPE_SUSPEND = "SUSPEND";
var EXIT_TYPE_FINISH = "FINISH";
var DEFAULT_EXIT_TYPE = EXIT_TYPE_SUSPEND;
var EXIT_SUSPEND_IF_COMPLETED = false;
var EXIT_NORMAL;
var blnDebug = true;
var blnCalledFinish = false;
var blnLoaded = false;
var blnReachedEnd = false;
var blnStatusWasSet = false;
var blnLmsPresent = false;
var dtmStart = null;
var dtmEnd = null;
var intAccumulatedMS = 0;
var blnOverrodeTime = false;
var aryDebug = new Array();
var winDebug;
var SHOW_DEBUG_ON_LAUNCH = false;
/**************  / Declare Variables   ****************/



/****************  Helper Functions  ******************/
function GetQueryStringValue(strElement, strQueryString) {
    var aryPairs;
    var foundValue;
    strQueryString = strQueryString.substring(1);
    aryPairs = strQueryString.split("&");
    foundValue = SearchQueryStringPairs(aryPairs, strElement);
    if (foundValue === null) {
        aryPairs = strQueryString.split(/[\?\&]/);
        foundValue = SearchQueryStringPairs(aryPairs, strElement);
    }
    if (foundValue === null) {
        WriteToDebug("GetQueryStringValue Element '" + strElement + "' Not Found, Returning: empty string");
        return "";
    } else {
        WriteToDebug("GetQueryStringValue for '" + strElement + "' Returning: " + foundValue);
        return foundValue;
    }
}

function SearchQueryStringPairs(aryPairs, strElement) {
    var i;
    var intEqualPos;
    var strArg = "";
    var strValue = "";
    strElement = strElement.toLowerCase();
    for (i = 0; i < aryPairs.length; i++) {
        intEqualPos = aryPairs[i].indexOf("=");
        if (intEqualPos !== -1) {
            strArg = aryPairs[i].substring(0, intEqualPos);
            if (EqualsIgnoreCase(strArg, strElement)) {
                strValue = aryPairs[i].substring(intEqualPos + 1);
                strValue = new String(strValue);
                strValue = strValue.replace(/\+/g, "%20");
                strValue = unescape(strValue);
                return new String(strValue);
            }
        }
    }
    return null;
}

function ConvertStringToBoolean(str) {
    var intTemp;
    if (
        EqualsIgnoreCase(str, "true") ||
        EqualsIgnoreCase(str, "t") ||
        str.toLowerCase().indexOf("t") == 0
    ) {
        return true;
    } else {
        intTemp = parseInt(str, 10);
        if (intTemp === 1 || intTemp === -1) {
            return true;
        } else {
            return false;
        }
    }
}

function EqualsIgnoreCase(str1, str2) {
    var blnReturn;
    str1 = new String(str1);
    str2 = new String(str2);
    blnReturn = str1.toLowerCase() === str2.toLowerCase();
    return blnReturn;
}

function ValidInteger(intNum) {
    WriteToDebug("In ValidInteger intNum=" + intNum);
    var str = new String(intNum);
    if (str.indexOf("-", 0) === 0) {
        str = str.substring(1, str.length - 1);
    }
    var regValidChars = new RegExp("[^0-9]");
    if (str.search(regValidChars) === -1) {
        WriteToDebug("Returning true");
        return true;
    }
    WriteToDebug("Returning false");
    return false;
}

function IsAlphaNumeric(strValue) {
    WriteToDebug("In IsAlphaNumeric");
    if (strValue.search(/\w/) < 0) {
        WriteToDebug("Returning false");
        return false;
    } else {
        WriteToDebug("Returning true");
        return true;
    }
}

function ReverseNameSequence(strName) {
    var strFirstName;
    var strLastName;
    var intCommaLoc;
    if (strName === "") strName = "Not Found, Learner Name";
    intCommaLoc = strName.indexOf(",");
    strFirstName = strName.slice(intCommaLoc + 1);
    strLastName = strName.slice(0, intCommaLoc);
    strFirstName = Trim(strFirstName);
    strLastName = Trim(strLastName);
    return strFirstName + " " + strLastName;
}

function LTrim(str) {
    str = new String(str);
    return str.replace(/^\s+/, "");
}

function RTrim(str) {
    str = new String(str);
    return str.replace(/\s+$/, "");
}

function Trim(strToTrim) {
    var str = LTrim(RTrim(strToTrim));
    return str.replace(/\s{2,}/g, " ");
}

function RoundToPrecision(number, significantDigits) {
    number = parseFloat(number);
    return (
        Math.round(number * Math.pow(10, significantDigits)) /
        Math.pow(10, significantDigits)
    );
}

function IsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
/**************  / Helper Functions   ******************/



function ConvertMilliSecondsToTCAPITime(intTotalMilliseconds) {
    WriteToDebug(
        "In ConvertMilliSecondsToTCAPITime intTotalMilliseconds= " +
        intTotalMilliseconds
    );
    var TCTime = "";
    var HundredthsOfASecond;
    var Seconds;
    var Minutes;
    var Hours;
    var Days;
    var Months;
    var Years;
    var HUNDREDTHS_PER_SECOND = 100;
    var HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
    var HUNDREDTHS_PER_HOUR = HUNDREDTHS_PER_MINUTE * 60;
    var HUNDREDTHS_PER_DAY = HUNDREDTHS_PER_HOUR * 24;
    var HUNDREDTHS_PER_MONTH = HUNDREDTHS_PER_DAY * ((365 * 4 + 1) / 48);
    var HUNDREDTHS_PER_YEAR = HUNDREDTHS_PER_MONTH * 12;
    HundredthsOfASecond = Math.floor(intTotalMilliseconds / 10);
    Years = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_YEAR);
    HundredthsOfASecond -= Years * HUNDREDTHS_PER_YEAR;
    Months = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MONTH);
    HundredthsOfASecond -= Months * HUNDREDTHS_PER_MONTH;
    Days = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_DAY);
    HundredthsOfASecond -= Days * HUNDREDTHS_PER_DAY;
    Hours = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_HOUR);
    HundredthsOfASecond -= Hours * HUNDREDTHS_PER_HOUR;
    Minutes = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MINUTE);
    HundredthsOfASecond -= Minutes * HUNDREDTHS_PER_MINUTE;
    Seconds = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_SECOND);
    HundredthsOfASecond -= Seconds * HUNDREDTHS_PER_SECOND;
    if (Years > 0) {
        TCTime += Years + "Y";
    }
    if (Months > 0) {
        TCTime += Months + "M";
    }
    if (Days > 0) {
        TCTime += Days + "D";
    }
    if (HundredthsOfASecond + Seconds + Minutes + Hours > 0) {
        TCTime += "T";
        if (Hours > 0) {
            TCTime += Hours + "H";
        }
        if (Minutes > 0) {
            TCTime += Minutes + "M";
        }
        if (HundredthsOfASecond + Seconds > 0) {
            TCTime += Seconds;
            if (HundredthsOfASecond > 0) {
                TCTime += "." + HundredthsOfASecond;
            }
            TCTime += "S";
        }
    }
    if (TCTime === "") {
        TCTime = "T0S";
    }
    TCTime = "P" + TCTime;
    WriteToDebug("Returning-" + TCTime);
    return TCTime;
}

function loadScript(url, callback) {
    var head = document.getElementsByTagName("head")[0],
        script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    if (
        !script.addEventListener ||
        (document.documentMode && document.documentMode < 9)
    ) {
        script.onreadystatechange = function () {
            if (/loaded|complete/.test(script.readyState)) {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.addEventListener("load", callback, false);
    }
    head.appendChild(script);
}

function Start() {
    TCAPI_ClearErrorInfo();
    blnLmsPresent = true;
    loadScript("../tc-config.js", TCAPI_Initialize);

    if (
        !(typeof SHOW_DEBUG_ON_LAUNCH == "undefined") &&
        SHOW_DEBUG_ON_LAUNCH === true
    ) {
        WriteToDebug("Showing Debug Window");
        ShowDebugWindow();
    }
    return;
}

function TCAPI_Initialize() {
    WriteToDebug("In TCAPI_Initialize");
    tcapi_cache = {
        totalPrevDuration: null,
        statementQueue: []
    };
    TinCan.prototype.log = TinCan.LRS.prototype.log = function (msg, src) {
        src = src || this.LOG_SRC || "TinCan";
        WriteToDebug("TinCan." + src + ": " + msg);
    };
    try {
        tincan = new TinCan({
            url: location.href,
            recordStores: TC_RECORD_STORES,
            activity: {
                id: TC_COURSE_ID,
                definition: {
                    name: TC_COURSE_NAME,
                    description: TC_COURSE_DESC
                }
            }
        });
    } catch (ex) {
        WriteToDebug("TCAPI_Initialize - TinCan construction failed: " + JSON.stringify(ex));
        return;
    }
    if (tincan.recordStores.length === 0) {
        WriteToDebug("TCAPI_Initialize - resulted in no LRS: DATA CANNOT BE STORED");
        return;
    }

    WriteToDebug("TCAPI_Initialize - fetching cumulative time from state: " + TCAPI_STATE_TOTAL_TIME);
    tincan.getState(TCAPI_STATE_TOTAL_TIME, {
        callback: function (err, state) {
            WriteToDebug("TCAPI_Initialize - getState callback ");
            //var contents;
            if (err !== null) {
                WriteToDebug("TCAPI_Initialize - getState callback - err: " + err.responseText + " (" + err.status + ")");
                return;
            }
            WriteToDebug("TCAPI_Initialize - getState callback - state: " + state);
            if (
                state !== null &&
                state.contents !== null &&
                state.contents.match(/^\d+$/)
            ) {
                tcapi_cache.totalPrevDuration = Number(state.contents);
            } else {
                tcapi_cache.totalPrevDuration = 0;
            }
        }
    });

    TCAPI_STATUS = TCAPI_INIT_VERB;
    TCAPI_IN_PROGRESS = true;
    WriteToDebug("TCAPI_Initialize - record initial launch statement");
    tincan.sendStatement({
            verb: TCAPI_INIT_VERB,
            inProgress: TCAPI_IN_PROGRESS
        },
        function (results, statement) {
            if (results[0].err !== null) {
                WriteToDebug(
                    "TCAPI_Initialize - record initial launch statement - err: " +
                    results[0].err.responseText +
                    " (" +
                    results[0].err.status +
                    ")"
                );
                return;
            }
            WriteToDebug(
                "TCAPI_Initialize - record initial launch statement success: " +
                statement.id
            );
        }
    );
    InitializeExecuted(true, "");
    return true;
}

function InitializeExecuted(blnSuccess, strErrorMessage) {
    WriteToDebug("In InitializeExecuted, blnSuccess= " + blnSuccess);
    if (!blnSuccess) {
        WriteToDebug("ERROR - LMS Initialize Failed");
        if (strErrorMessage === "") {
            strErrorMessage = "An Error Has Occurred";
        }
        blnLmsPresent = false;
        DisplayError(strErrorMessage);
        return;
    }
    blnLoaded = true;
    dtmStart = new Date();
    LoadContent(); // on indexAPI.html
    return;
}

function IsLoaded() {
    WriteToDebug("In IsLoaded, returning -" + blnLoaded);
    return blnLoaded;
}

function _TCAPI_SetStateSafe(key, value) {
    var result;
    try {
        result = tincan.setState(key, value);
    } catch (ex) {
        WriteToDebug(
            "In _TCAPI_SetStateSafe - caught exception from setState: " + ex.message
        );
    }
    return result;
}

function TCAPI_GetStudentID() {
    WriteToDebug("In TCAPI_GetStudentID");
    return tincan.actor.mbox;
}

function TCAPI_GetStudentName() {
    WriteToDebug("In TCAPI_GetStudentName");
    return tincan.actor !== null ? tincan.actor.toString() : "";
}

function TCAPI_GetBookmark() {
    WriteToDebug("In TCAPI_GetBookmark");
    var bookmark = "",
        getStateResult = tincan.getState(TCAPI_STATE_BOOKMARK);
    if (getStateResult.state !== null) {
        bookmark = getStateResult.state.contents;
    }
    return bookmark;
}

function TCAPI_SetBookmark(value, name) {
    WriteToDebug("In TCAPI_SetBookmark - value: " + value + ", name: " + name);
    _TCAPI_SetStateSafe(TCAPI_STATE_BOOKMARK, value);
    WriteToDebug("In TCAPI_SetBookmark - sending statement: " + value);
    tincan.sendStatement({
        verb: TCAPI_VERB_EXPERIENCED,
        object: {
            id: tincan.activity.id + "/" + value,
            definition: {
                name: {
                    "en-US": ((name !== undefined && name !== "") ? name : value)
                }
            }
        },
        context: {
            contextActivities: {
                parent: tincan.activity
            }
        }
    }, function (results, statement) {
        if (results[0].err !== null) {
            WriteToDebug("TCAPI_SetBookmark - sending statement: " + value + " - err: " + results[0].err.responseText + " (" + results[0].err.status + ")");
            return;
        }
        WriteToDebug("TCAPI_SetBookmark - sending statement success: " + value + " - id: " + statement.id);
    });
    return true;
}

function TCAPI_GetDataChunk() {
    WriteToDebug("In TCAPI_GetDataChunk");
    var data = "",
        getStateResult = tincan.getState(TCAPI_STATE_SUSPEND_DATA);
    if (getStateResult.state !== null) {
        data = getStateResult.state.contents;
    }
    return data;
}

function TCAPI_SetDataChunk(value) {
    WriteToDebug("In TCAPI_SetDataChunk");
    _TCAPI_SetStateSafe(TCAPI_STATE_SUSPEND_DATA, value);
    return true;
}

function TCAPI_SetScore(intScore, intMaxScore, intMinScore) {
    WriteToDebug("In TCAPI_SetScore intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
    TCAPI_ClearErrorInfo();
    TCAPI_SCORE["raw"] = intScore;
    TCAPI_SCORE["max"] = intMaxScore;
    TCAPI_SCORE["min"] = intMinScore;
    WriteToDebug("Returning " + TCAPI_SCORE);
    TCAPI_UPDATES_PENDING = true;
    return true;
}

function TCAPI_GetScore() {
    WriteToDebug("In TCAPI_GetScore");
    TCAPI_ClearErrorInfo();
    WriteToDebug("Returning " + TCAPI_SCORE['raw']);
    return TCAPI_SCORE['raw'];
}



/****************  ResponseIdentifier   ******************/
function CreateResponseIdentifier(strShort, strLong) {
    if (strShort.replace(" ", "") == "") {
        WriteToDebug("Short Identifier is empty");
        SetErrorInfo(ERROR_INVALID_ID, "Invalid short identifier, strShort=" + strShort);
        return false;
    }
    if (strShort.length != 1) {
        WriteToDebug("ERROR - Short Identifier  not 1 character");
        SetErrorInfo(ERROR_INVALID_ID, "Invalid short identifier, strShort=" + strShort);
        return false;
    }
    if (!IsAlphaNumeric(strShort)) {
        WriteToDebug("ERROR - Short Identifier  not alpha numeric");
        SetErrorInfo(ERROR_INVALID_ID, "Invalid short identifier, strShort=" + strShort);
        return false;
    }
    strShort = strShort.toLowerCase();
    strLong = CreateValidIdentifier(strLong);
    return new ResponseIdentifier(strShort, strLong);
}

function ResponseIdentifier(strShort, strLong) {
    this.Short = new String(strShort);
    this.Long = new String(strLong);
    this.toString = function () {
        return "[Response Identifier " + this.Short + ", " + this.Long + "]";
    };
}

function MatchingResponse(source, target) {
    if (source.constructor == String) {
        source = CreateResponseIdentifier(source, source);
    }
    if (target.constructor == String) {
        target = CreateResponseIdentifier(target, target);
    }
    this.Source = source;
    this.Target = target;
    this.toString = function () {
        return "[Matching Response " + this.Source + ", " + this.Target + "]";
    };
}

function CreateMatchingResponse(pattern) {
    var aryPairs = new Array();
    var aryEachPair = new Array();
    pattern = new String(pattern);
    aryPairs = pattern.split("[,]");
    for (var i = 0; i < aryPairs.length; i++) {
        var thisPair = new String(aryPairs[i]);
        aryEachPair = thisPair.split("[.]");
        WriteToDebug("Matching Response [" + i + "]  source: " + aryEachPair[0] + "  target: " + aryEachPair[1]);
        aryPairs[i] = new MatchingResponse(aryEachPair[0], aryEachPair[1]);
    }
    WriteToDebug("pattern: " + pattern + " becomes " + aryPairs[0]);
    if (aryPairs.length == 0) return aryPairs[0];
    else return aryPairs;
}

function CreateValidIdentifier(str) {
    if (str != null || str != "") {
        str = new String(str);
        str = Trim(str);
        if (str.toLowerCase().indexOf("urn:") == 0) {
            str = str.substr(4);
        }
        str = str.replace(/[^\w\-\(\)\+\.\:\=\@\;\$\_\!\*\'\%]/g, "_");
        return str;
    } else {
        return "";
    }
}

function Trim(str) {
    str = str.replace(/^\s*/, "");
    str = str.replace(/\s*$/, "");
    return str;
}
/**************  / ResponseIdentifier   ******************/

/****************  Record Interactions   ******************/
function TCAPI_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPIInteractionType, strAlternateResponse, strAlternateCorrectResponse) {
    var blnTempResult, intInteractionIndex, strResult, actObj = {},
        stmt, interactionActivityId = tincan.activity.id + "-" + strID,
        interactionActivityType = TCAPI_INTERACTION;
    TCAPI_ClearErrorInfo();
    switch (TCAPIInteractionType) {
        case "true-false":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "true-false",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "choice":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "choice",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "fill-in":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "fill-in",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "matching":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "matching",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "performance":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "performance",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "sequencing":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "sequencing",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "likert":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "likert",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "numeric":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "numeric",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        case "other":
            actObj = {
                id: interactionActivityId,
                definition: {
                    description: {
                        'en-US': strDescription
                    },
                    type: interactionActivityType,
                    interactionType: "other",
                    correctResponsesPattern: [strCorrectResponse]
                }
            };
            break;
        default:
            WriteToDebug("TCAPI_RecordInteraction received an invalid TCPAIInteractionType of " + TCAPIInteractionType);
            return false;
    }
    if (actObj.id !== null) {
        stmt = {
            verb: TCAPI_VERB_ANSWERED,
            object: actObj,
            context: {
                contextActivities: {
                    parent: tincan.activity,
                    grouping: {
                        id: tincan.activity.id + '-' + strLearningObjectiveID
                    }
                }
            }
        };
        if (strResponse !== null) {
            stmt.result = {
                response: strResponse,
                success: blnCorrect
            };
        }
        tcapi_cache.statementQueue.push(stmt);
    }
    return true;
}

function TCAPI_RecordTrueFalseInteraction(strID, blnResponse, blnCorrect, blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordTrueFalseInteraction strID=" + strID + ", strResponse=" + blnResponse + ", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + blnCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    var strResponse = "",
        strCorrectResponse = null;
    if (blnResponse === true) {
        strResponse = "true";
    } else {
        strResponse = "false";
    }
    if (blnCorrectResponse === true) {
        strCorrectResponse = "true";
    } else if (blnCorrectResponse === false) {
        strCorrectResponse = "false";
    }
    return TCAPI_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_TRUE_FALSE, strResponse, strCorrectResponse);
}

function TCAPI_RecordMultipleChoiceInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordMultipleChoiceInteraction strID=" + strID + ", aryResponse=" + aryResponse + ", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    var strResponse = "",
        strResponseLong = "",
        strCorrectResponse = "",
        strCorrectResponseLong = "";
    for (var i = 0; i < aryResponse.length; i++) {
        if (strResponse.length > 0) {
            strResponse += "[,]";
        }
        if (strResponseLong.length > 0) {
            strResponseLong += "[,]";
        }
        strResponse += aryResponse[i].Short;
        strResponseLong += aryResponse[i].Long;
    }
    for (var i = 0; i < aryCorrectResponse.length; i++) {
        if (strCorrectResponse.length > 0) {
            strCorrectResponse += "[,]";
        }
        if (strCorrectResponseLong.length > 0) {
            strCorrectResponseLong += "[,]";
        }
        strCorrectResponse += aryCorrectResponse[i].Short;
        strCorrectResponseLong += aryCorrectResponse[i].Long;
    }
    return TCAPI_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_CHOICE, strResponse, strCorrectResponse);
}

function TCAPI_RecordFillInInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordFillInInteraction strID=" + strID + ", strResponse=" + strResponse + ", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    strResponse = new String(strResponse);
    if (strResponse.length > 255) {
        strResponse = strResponse.substr(0, 255);
    }
    if (strCorrectResponse === null) {
        strCorrectResponse = "";
    }
    strCorrectResponse = new String(strCorrectResponse);
    if (strCorrectResponse.length > 255) {
        strCorrectResponse = strCorrectResponse.substr(0, 255);
    }
    return TCAPI_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_FILL_IN, strResponse, strCorrectResponse);
}

function TCAPI_RecordMatchingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordMatchingInteraction strID=" + strID + ", aryResponse=" + aryResponse + ", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    var strResponse = "";
    strResponseLong = "", strCorrectResponse = "", strCorrectResponseLong = "";
    for (var i = 0; i < aryResponse.length; i++) {
        if (strResponse.length > 0) {
            strResponse += "[,]";
        }
        if (strResponseLong.length > 0) {
            strResponseLong += "[,]";
        }
        strResponse += aryResponse[i].Source.Short + "[.]" + aryResponse[i].Target.Short;
        strResponseLong += aryResponse[i].Source.Long + "[.]" + aryResponse[i].Target.Long;
    }
    for (var i = 0; i < aryCorrectResponse.length; i++) {
        if (strCorrectResponse.length > 0) {
            strCorrectResponse += "[,]";
        }
        if (strCorrectResponseLong.length > 0) {
            strCorrectResponseLong += "[,]";
        }
        strCorrectResponse += aryCorrectResponse[i].Source.Short + "[.]" + aryCorrectResponse[i].Target.Short;
        strCorrectResponseLong += aryCorrectResponse[i].Source.Long + "[.]" + aryCorrectResponse[i].Target.Long;
    }
    return TCAPI_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_MATCHING, strResponse, strCorrectResponse);
}

function TCAPI_RecordPerformanceInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordPerformanceInteraction strID=" + strID + ", strResponse=" + strResponse + ", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    strResponse = new String(strResponse);
    if (strResponse.length > 255) {
        strResponse = strResponse.substr(0, 255);
    }
    if (strCorrectResponse == null) {
        strCorrectResponse = "";
    }
    strCorrectResponse = new String(strCorrectResponse);
    if (strCorrectResponse.length > 255) {
        strCorrectResponse = strCorrectResponse.substr(0, 255);
    }
    return TCAPI_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_PERFORMANCE, strResponse, strCorrectResponse);
}

function TCAPI_RecordSequencingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordSequencingInteraction strID=" + strID + ", aryResponse=" + aryResponse + ", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    var strResponse = "",
        strResponseLong = "",
        strCorrectResponse = "",
        strCorrectResponseLong = "";
    for (var i = 0; i < aryResponse.length; i++) {
        if (strResponse.length > 0) {
            strResponse += "[,]";
        }
        if (strResponseLong.length > 0) {
            strResponseLong += "[,]";
        }
        strResponse += aryResponse[i].Short;
        strResponseLong += aryResponse[i].Long;
    }
    for (var i = 0; i < aryCorrectResponse.length; i++) {
        if (strCorrectResponse.length > 0) {
            strCorrectResponse += "[,]";
        }
        if (strCorrectResponseLong.length > 0) {
            strCorrectResponseLong += "[,]";
        }
        strCorrectResponse += aryCorrectResponse[i].Short;
        strCorrectResponseLong += aryCorrectResponse[i].Long;
    }
    return TCAPI_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_SEQUENCING, strResponse, strCorrectResponse);
}

function TCAPI_RecordLikertInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    // RecordLikertInteraction is often used for survey questions such as “Rate your experience on a scale from 1 to 10”
    WriteToDebug("In TCAPI_RecordLikertInteraction strID=" + strID + ", response=" + response + ", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    var strResponse = response.Short,
        strResponseLong = response.Long,
        strCorrectResponse = "",
        strCorrectResponseLong = "";
    if (correctResponse !== null) {
        strCorrectResponse = correctResponse.Short;
        strCorrectResponseLong = correctResponse.Long;
    }
    return TCAPI_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_LIKERT, strResponse, strCorrectResponse);
}

function TCAPI_RecordNumericInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime) {
    WriteToDebug("In TCAPI_RecordNumericInteraction strID=" + strID + ", strResponse=" + strResponse + ", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + ", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);
    return TCAPI_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, TCAPI_INTERACTION_TYPE_NUMERIC, strResponse, strCorrectResponse);
}
/**************  / Record Interactions   ******************/




function TCAPI_GetEntryMode() {
    WriteToDebug("In TCAPI_GetEntryMode");
    return null;
}

function TCAPI_GetLessonMode() {
    WriteToDebug("In TCAPI_GetLessonMode");
    return null;
}

function TCAPI_GetTakingForCredit() {
    WriteToDebug("In TCAPI_GetTakingForCredit");
    return null;
}

function TCAPI_SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore) {
    WriteToDebug("In TCAPI_SetObjectiveScore, strObejctiveID=" + strObjectiveID + ", intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
}

function TCAPI_SetObjectiveDescription(strObjectiveID, strObjectiveDescription) {
    WriteToDebug("In TCAPI_SetObjectiveDescription, strObjectiveDescription=" + strObjectiveDescription);
    TCAPI_ClearErrorInfo();
    return TCAPI_TRUE;
}

function TCAPI_SetObjectiveStatus(strObjectiveID, Lesson_Status) {
    WriteToDebug("In TCAPI_SetObjectiveStatus strObjectiveID=" + strObjectiveID + ", Lesson_Status=" + Lesson_Status);
}

function TCAPI_GetObjectiveScore(strObjectiveID) {
    WriteToDebug("In TCAPI_GetObjectiveScore, strObejctiveID=" + strObjectiveID);
}

function TCAPI_GetObjectiveDescription(strObjectiveID) {
    WriteToDebug("In TCAPI_GetObjectiveDescription, strObejctiveID=" + strObjectiveID);
    return "";
}

function TCAPI_GetObjectiveStatus(strObjectiveID) {
    WriteToDebug("In TCAPI_GetObjectiveStatus, strObejctiveID=" + strObjectiveID);
}

function TCAPI_SetFailed() {
    WriteToDebug("In TCAPI_SetFailed");
    TCAPI_STATUS = TCAPI_VERB_FAILED;
    TCAPI_STATUS_CHANGED = true;
    TCAPI_SATISFACTION_STATUS = false;
    TCAPI_IN_PROGRESS = false;
    TCAPI_UPDATES_PENDING = true;
    return true;
}

function TCAPI_SetPassed() {
    WriteToDebug("In TCAPI_SetPassed");
    TCAPI_STATUS = TCAPI_VERB_PASSED;
    TCAPI_STATUS_CHANGED = true;
    TCAPI_SATISFACTION_STATUS = true;
    TCAPI_IN_PROGRESS = false;
    TCAPI_UPDATES_PENDING = true;
    return true;
}

function TCAPI_SetCompleted() {
    WriteToDebug("In TCAPI_SetCompleted");
    TCAPI_ClearErrorInfo();
    if (TCAPI_STATUS === TCAPI_INIT_VERB) {
        TCAPI_STATUS = TCAPI_VERB_COMPLETED;
        TCAPI_STATUS_CHANGED = true;
    }
    TCAPI_COMPLETION_STATUS = TCAPI_VERB_COMPLETED;
    TCAPI_IN_PROGRESS = false;
    TCAPI_UPDATES_PENDING = true;
    return true;
}

function TCAPI_ResetStatus() {
    WriteToDebug("In TCAPI_ResetStatus");
    TCAPI_ClearErrorInfo();
    TCAPI_STATUS = TCAPI_INIT_VERB;
    TCAPI_STATUS_CHANGED = true;
    TCAPI_COMPLETION_STATUS = "";
    TCAPI_SATISFACTION_STATUS = null;
    TCAPI_IN_PROGRESS = true;
    TCAPI_UPDATES_PENDING = true;
    return true;
}

function TCAPI_GetStatus() {
    WriteToDebug("In TCAPI_GetStatus");
    var strStatus = "";
    TCAPI_ClearErrorInfo();
    if (TCAPI_STATUS === TCAPI_VERB_COMPLETED) {
        strStatus = "completed";
    } else if (TCAPI_STATUS === TCAPI_VERB_ATTEMPTED) {
        strStatus = "attempted";
    } else if (TCAPI_STATUS === TCAPI_VERB_PASSED) {
        strStatus = "passed";
    } else if (TCAPI_STATUS === TCAPI_VERB_FAILED) {
        strStatus = "failed";
    } else {
        strStatus = TCAPI_STATUS;
    }
    WriteToDebug("In TCAPI_GetStatus - strStatus=" + strStatus);
    return strStatus;
}

function TCAPI_GetCompletionStatus() {
    WriteToDebug("In TCAPI_GetCompletionStatus: returning TCAPI_COMPLETION_STAUS: " + TCAPI_COMPLETION_STATUS);
    return TCAPI_COMPLETION_STATUS;
}

function TCAPI_GetPreviouslyAccumulatedTime() {
    WriteToDebug("In TCAPI_GetPreviouslyAccumulatedTime");
    var data = 0,
        getStateResult;
    WriteToDebug(
        "In TCAPI_GetPreviouslyAccumulatedTime - cached: " +
        tcapi_cache.totalPrevDuration
    );
    if (tcapi_cache.totalPrevDuration === null) {
        getStateResult = tincan.getState(TCAPI_STATE_TOTAL_TIME);
        if (getStateResult.state !== null) {
            data = Number(getStateResult.state.contents);
        }
        tcapi_cache.totalPrevDuration = data === NaN ? 0 : data;
    }
    return tcapi_cache.totalPrevDuration;
}

function TCAPI_SaveTime(intMilliSeconds) {
    WriteToDebug("In TCAPI_SaveTime " + intMilliSeconds);
    return true;
}

function TCAPI_GetMaxTimeAllowed() {
    WriteToDebug("In TCAPI_GetMaxTimeAllowed");
    return null;
}

function AccumulateTime() {
    WriteToDebug(
        "In AccumulateTime dtmStart=" +
        dtmStart +
        " dtmEnd=" +
        dtmEnd +
        " intAccumulatedMS=" +
        intAccumulatedMS
    );
    if (dtmEnd !== null && dtmStart !== null) {
        WriteToDebug("Accumulating Time");
        intAccumulatedMS += dtmEnd.getTime() - dtmStart.getTime();
        WriteToDebug("intAccumulatedMS=" + intAccumulatedMS);
    }
}

function GetSessionAccumulatedTime() {
    WriteToDebug("In GetSessionAccumulatedTime");
    TCAPI_ClearErrorInfo();
    WriteToDebug("Setting dtmEnd to now");
    dtmEnd = new Date();
    WriteToDebug("Accumulating Time");
    AccumulateTime();
    if (dtmStart !== null) {
        WriteToDebug("Resetting dtmStart");
        dtmStart = new Date();
    }
    WriteToDebug("Setting dtmEnd to null");
    dtmEnd = null;
    WriteToDebug("Returning " + intAccumulatedMS);
    return intAccumulatedMS;
}

function ExecFinish(ExitType) {
    WriteToDebug("In ExecFinish, ExiType=" + ExitType);
    TCAPI_ClearErrorInfo();
    if (blnLoaded && !blnCalledFinish) {
        WriteToDebug("Haven't called finish before, finishing");
        blnCalledFinish = true;
        if (
            (blnReachedEnd && !EXIT_SUSPEND_IF_COMPLETED) ||
            (TCAPI_GetStatus() === TCAPI_VERB_PASSED &&
                EXIT_NORMAL_IF_PASSED === true)
        ) {
            WriteToDebug("Reached End, overiding exit type to FINISH");
            ExitType = EXIT_TYPE_FINISH;
        }
        if (!blnOverrodeTime) {
            WriteToDebug("Did not override time");
            dtmEnd = new Date();
            AccumulateTime();
            TCAPI_SaveTime(intAccumulatedMS);
        }
        blnLoaded = false;
        WriteToDebug("Calling LMS Finish");
        return TCAPI_Finish(ExitType, blnStatusWasSet);
    }
    return true;
}

function TCAPI_SetSuspended() {
    WriteToDebug("In TCAPI_SetSuspended");
    if (TCAPI_IN_PROGRESS) {
        TCAPI_IN_PROGRESS = false;
        TCAPI_UPDATES_PENDING = true;
    }
    return true;
}

function TCAPI_Finish(exitType, TCAPI_STATUS_CHANGED) {
    WriteToDebug("In TCAPI_Finish - exitType: " + exitType + " statusWasSet:" + TCAPI_STATUS_CHANGED);
    if (exitType === EXIT_TYPE_SUSPEND) {
        _TCAPI_SetStateSafe(
            TCAPI_STATE_TOTAL_TIME,
            TCAPI_GetPreviouslyAccumulatedTime() + GetSessionAccumulatedTime()
        );
        TCAPI_SetSuspended();
    }
    TCAPI_CommitData();
    return true;
}

function Unload() {
    WriteToDebug("In Unload");
    TCAPI_ClearErrorInfo();
    if ((blnReachedEnd && !EXIT_SUSPEND_IF_COMPLETED) || (TCAPI_GetStatus() == TCAPI_VERB_PASSED && EXIT_NORMAL_IF_PASSED == true)) {
        WriteToDebug("In Unload - Finish");
        return ExecFinish(EXIT_TYPE_FINISH);
    } else {
        WriteToDebug("In Unload - Suspend");
        return ExecFinish(EXIT_TYPE_SUSPEND);
    }
}

function SetReachedEnd() {
    WriteToDebug("In SetReachedEnd");
    TCAPI_ClearErrorInfo();
    if (!IsLoaded()) {
        TCAPI_SetErrorInfo();
        return false;
    }
    if (blnStatusWasSet === false) {
        TCAPI_SetCompleted();
    }
    blnReachedEnd = true;
    return true;
}

function TCAPI_CommitData() {
    WriteToDebug("In TCAPI_CommitData - TCAPI_STATUS: " + TCAPI_STATUS);
    WriteToDebug("In TCAPI_CommitData - TCAPI_UPDATES_PENDING: " + TCAPI_UPDATES_PENDING);
    TCAPI_ClearErrorInfo();
    var stmt;
    if (TCAPI_UPDATES_PENDING) {
        stmt = {
            verb: TCAPI_STATUS,
            inProgress: TCAPI_IN_PROGRESS,
            result: {}
        };
        if (TCAPI_COMPLETION_STATUS !== "" || !TCAPI_IN_PROGRESS) {
            stmt.result.duration = ConvertMilliSecondsToTCAPITime(
                GetSessionAccumulatedTime() + TCAPI_GetPreviouslyAccumulatedTime()
            );
            WriteToDebug("In TCAPI_CommitData - stmt.result.duration: " + stmt.result.duration);
        }
        if (TCAPI_COMPLETION_STATUS !== "") {
            stmt.result.completion = true;
        }
        if (TCAPI_SATISFACTION_STATUS !== null) {
            stmt.result.success = TCAPI_SATISFACTION_STATUS;
        }
        if (typeof TCAPI_SCORE.raw !== "undefined") {
            stmt.result.score = TCAPI_SCORE;
        }
        tcapi_cache.statementQueue.push(stmt);
        TCAPI_UPDATES_PENDING = false;
    }
    if (tcapi_cache.statementQueue.length > 0) {
        tincan.sendStatements(tcapi_cache.statementQueue);
        tcapi_cache.statementQueue = [];
    }
    return true;
}




/***************   Debugging & Error Messages   *****************/
function TCAPI_ClearErrorInfo() {
    WriteToDebug("In TCAPI_ClearErrorInfo");
    intTCAPIError = TCAPI_NO_ERROR;
    strTCAPIErrorString = "";
    strTCAPIErrorDiagnostic = "";
}

function TCAPI_SetErrorInfo() {
    WriteToDebug("In TCAPI_SetErrorInfo");
    intTCAPIError = TCAPI_objAPI.LMSGetLastError();
    strTCAPIErrorString = TCAPI_objAPI.LMSGetErrorString(intTCAPIError);
    strTCAPIErrorDiagnostic = TCAPI_objAPI.LMSGetDiagnostic("");
    intTCAPIError = intTCAPIError + "";
    strTCAPIErrorString = strTCAPIErrorString + "";
    strTCAPIErrorDiagnostic = strTCAPIErrorDiagnostic + "";
    WriteToDebug("intTCAPIError=" + intTCAPIError);
    WriteToDebug("strTCAPIErrorString=" + strTCAPIErrorString);
    WriteToDebug("strTCAPIErrorDiagnostic=" + strTCAPIErrorDiagnostic);
}

function TCAPI_SetErrorInfoManually(intNum, strString, strDiagnostic) {
    WriteToDebug("In TCAPI_SetErrorInfoManually");
    WriteToDebug("ERROR-Num=" + intNum);
    WriteToDebug("      String=" + strString);
    WriteToDebug("      Diag=" + strDiagnostic);
    intTCAPIError = intNum;
    strTCAPIErrorString = strString;
    strTCAPIErrorDiagnostic = strDiagnostic;
}

function TCAPI_GetLastError() {
    WriteToDebug("In TCAPI_GetLastError");
    if (intTCAPIError === TCAPI_NO_ERROR) {
        WriteToDebug("Returning No Error");
        return NO_ERROR;
    } else {
        WriteToDebug("Returning " + intTCAPIError);
        return intTCAPIError;
    }
}

function TCAPI_GetLastErrorDesc() {
    WriteToDebug(
        "In TCAPI_GetLastErrorDesc, " +
        strTCAPIErrorString +
        "\n" +
        strTCAPIErrorDiagnostic
    );
    return strTCAPIErrorString + "\n" + strTCAPIErrorDiagnostic;
}

function WriteToDebug(strInfo) {
    if (blnDebug) {
        var dtm = new Date();
        var strLine;
        strLine = aryDebug.length + ":" + dtm.toString() + " - " + strInfo;
        aryDebug[aryDebug.length] = strLine;
        if (winDebug && !winDebug.closed) {
            winDebug.document.write(strLine + "<br>\n");
        }
    }
    return;
}

function ShowDebugWindow() {
    if (winDebug && !winDebug.closed) {
        winDebug.close();
    }
    winDebug = window.open(
        "blank.html",
        "Debug",
        "width=900,height=700,resizable,scrollbars"
    );
    winDebug.document.write(aryDebug.join("<br>\n"));
    winDebug.document.close();
    winDebug.focus();
    return;
}

function DisplayError(strMessage) {
    var blnShowDebug;
    WriteToDebug("In DisplayError, strMessage=" + strMessage);
    blnShowDebug = confirm(
        "An error has occured:\n\n" +
        strMessage +
        "\n\nPress 'OK' to view debug information to send to technical support."
    );
    if (blnShowDebug) {
        ShowDebugWindow();
    }
}
/**************  / Debugging & Error Messages  ******************/
