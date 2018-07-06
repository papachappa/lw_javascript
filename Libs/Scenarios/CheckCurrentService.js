include('../Utilities.js');
include('../ChannelChange.js');

init = function () {

/** @namespace
* Test script to check current services and playback ability.
* @requires Library: {@link Utilities}, {@link ChannelChange}
*/
CheckCurrentService = {

SID: undefined,
TSID: undefined,
ONID: undefined,
PLAYBACK: undefined,
RANGE: undefined,
SYMBOLRATE_RANGE: undefined,
STREAM_PARAMETERS: [],
CURRENT_URI: [],
SUBTITLE: 'DNC',
AUDIO: 'DNC',
CHECK: 0,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},
RESULT:true,

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckCurrentService
 *
 * @param {number} serviceID
 * Service ID, DCN should be set to skip it from verification
 * 
 * @param {number} streamID
 * Transport stream ID, DCN should be set to skip it from verification
 * 
 * @param {number} networkID
 * Original network ID, DCN should be set to skip it from verification
 * 
 * @param {number} playback
 * Playback, DCN should be set to skip it from verification
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set CheckCurrentService will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (serviceID,
                     streamID,
                     networkID,
                     playback,
                     streamingPram,
                     frError,
                     srError,
                     content,
                     exitFunc) {
    if ( typeof(serviceID) == "undefined" || serviceID === "") {
        Utilities.print("#ERROR: input parameter 'serviceID' is not "
                    + "specified as required current library."
                    + "It should be expected value or DO_NOT_CHECK.");
        Utilities.print("Test is terminated.");
        setTimeout(jbiz.exit,1000)
    }
    else {
        CheckCurrentService.SID = serviceID;
    };
    
    if ( typeof(streamID) == "undefined" || streamID === "") {
        Utilities.print("#ERROR: input parameter 'streamID' is not "
                    + "specified as required current library."
                    + "It should be expected value or DO_NOT_CHECK.");
        Utilities.print("Test is terminated.")
        setTimeout(jbiz.exit,1000)
    }
    else {
        CheckCurrentService.TSID = streamID;
    };
    
    if ( typeof(networkID) == "undefined" || networkID === "") {
        Utilities.print("#ERROR: input parameter 'networkID' is not "
                    + "specified as required current library."
                    + "It should be expected value or DO_NOT_CHECK.");
        Utilities.print("Test is terminated.")
        setTimeout(jbiz.exit,1000)
    }
    else {
        CheckCurrentService.ONID = networkID;
    };
    
    if ( typeof(playback) == "undefined" || playback === "") {
        Utilities.print("#ERROR: input parameter 'playback' is not "
                    + "specified as required current library."
                    + "It should be expected value or DO_NOT_CHECK.");
        setTimeout(jbiz.exit,1000)
    }
    else {
        CheckCurrentService.PLAYBACK = playback;
    };
    
    if ( typeof(streamingPram) == "undefined" || streamingPram === "") {
        Utilities.print("INFO: streaming parameters will not be checked");
    }
    else {
        var end;
        ListStreamingParameters.forEach(
            function(item){
                end = CheckCurrentService.STREAM_PARAMETERS.length;
                if (streamingPram.hasOwnProperty(item)){
                    if (streamingPram[item]!="DNC"){
                        CheckCurrentService.CHECK = 1;
                    }
                    CheckCurrentService.STREAM_PARAMETERS[end] = String(streamingPram[item]);
                }
                else {
                    CheckCurrentService.STREAM_PARAMETERS[end] = "DNC"
                }
            }
        );
    };
    
    if ( typeof(content) == "undefined" || content == "" || content == []) {
        Utilities.print("INFO: content will not be checked");
    }
    else {
        if (content.hasOwnProperty("subtitle")) {
            if (Utilities.numberOfElements(content.subtitle) > 0){
                CheckCurrentService.SUBTITLE = content.subtitle
            }
             
        }
        if (content.hasOwnProperty("audio")) {
            if (Utilities.numberOfElements(content.audio) > 0){
                CheckCurrentService.AUDIO = content.audio
            }
             
        }
    }
    
    

    if ( typeof(frError) == "undefined" || frError == "") {
        if (CheckCurrentService.STREAM_PARAMETERS.frequency != "DNC") {
            Utilities.print("INFO: equal frequency value will be checked");
                CheckCurrentService.RANGE = 0;
        }
    }
    else {
        CheckCurrentService.RANGE = frError;
    }
    
    if ( typeof(srError) == "undefined" || srError == "") {
        if (CheckCurrentService.STREAM_PARAMETERS.symbolrate != "DNC") {
            Utilities.print("INFO: equal symbolrate value will be checked");
                    CheckCurrentService.SYMBOLRATE_RANGE = 0;
        }
    }
    else {
        CheckCurrentService.SYMBOLRATE_RANGE = srError;
    }
    
    if ( typeof(exitFunc) == "undefined" || exitFunc == "") {
        CheckCurrentService.manager(["Connect"])
    }
    else {
        CheckCurrentService.END=exitFunc;
        CheckCurrentService.manager(["CheckServices"])
    }
},

/**
 * Check playback ability for all listed channels
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckCurrentService
 * @requires Library: {@link Utilities}, {@link ChannelChange}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Check DVB triplet of current service.");
            Utilities.print("3. Check URI of current service.");
            Utilities.print("4. Check playback of current service.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                CheckCurrentService.manager(["CheckServices"]);
            });
        },
        "CheckServices" : function() {
            var currentChannel = de.loewe.sl2.tvservice.uri.main.getValue();
//          var currentChannel = "rec://plain/dvbs?frontend=4&satid=6&coderate=6&frequency=11220076&symbolrate=27499&inversion=1&modulation=2&polarization=1&band=1&onid=3&sid=13134&tsid=3219";
            if ( CheckCurrentService.SID == "DNC" &&
                 CheckCurrentService.TSID == "DNC" && CheckCurrentService.ONID == "DNC" ) {
                Utilities.print("INFO: current services is not checked "
                    + "as far as none of DVB triplet parameters are"
                    + " specified."); 
   
            }
            else {
                Utilities.print("Check DVB triplet for current service.")
//                var reg = /onid=\d+&sid=\d+&tsid=\d+/;//DVB triplet
                var currentService = ""; 
                var expectedService = "";
                if ( CheckCurrentService.ONID != "DNC" ) {
                    var onidreg = /onid=\d+/;
                    currentService = currentService + String(onidreg.exec(currentChannel))
                    expectedService = expectedService + "onid=" + CheckCurrentService.ONID
                }
                if ( CheckCurrentService.TSID != "DNC" ) {
                    var tsidreg = /tsid=\d+/;
                    currentService = currentService + String(tsidreg.exec(currentChannel))
                    expectedService = expectedService + "tsid=" + CheckCurrentService.TSID
                }
                if ( CheckCurrentService.SID != "DNC" ) {
                    var sidreg = /sid=\d+/;
                    currentService = currentService + String(sidreg.exec(currentChannel))
                    expectedService = expectedService + "sid=" + CheckCurrentService.SID
                }
                if (currentService == expectedService) {
                    Utilities.print("#VERIFICATION PASSED: Current channel"
                                    + " is equal to expected.");
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: Current channel"
                        + " is NOT equal to expected.");
                    Utilities.print("INFO: Current URI = "
                    + currentChannel);
                    Utilities.print("WARN: Playback verification will not be executed");
                    CheckCurrentService.manager(['EndTest'])
                    CheckCurrentService.RESULT=false; 
                }
            };
            if ( CheckCurrentService.CHECK == 1 ) {
                Utilities.print("Check streaming parameters...");
                ListStreamingParameters.forEach(
                    function(item){
//create regex for current item
                        var currentReg = new RegExp(String(item+"=(\\d+)"));
                        var last = CheckCurrentService.CURRENT_URI.length;
                        if (currentReg.exec(currentChannel)){
//add to the end of array value for current item
                            CheckCurrentService.CURRENT_URI[last] 
                                = currentReg.exec(currentChannel)[1];
                        }
                        else {
                            CheckCurrentService.CURRENT_URI[last] = "NA"
                        }
                    });
//add service identifier at the end of array for pretty printing
                CheckCurrentService.STREAM_PARAMETERS
                    [CheckCurrentService.STREAM_PARAMETERS.length] = expectedService;
                CheckCurrentService.CURRENT_URI
                    [CheckCurrentService.CURRENT_URI.length] = currentService;

//Compare.makeDictionary requires [[]] array, additional [] is added
                var resultDict = Compare.makeDictionary(
                                    [CheckCurrentService.STREAM_PARAMETERS],
                                    [CheckCurrentService.CURRENT_URI],
                                    function(line){return line[line.length-1]},
                                    2,
                                    CheckCurrentService.RANGE,
                                    4,
                                    CheckCurrentService.SYMBOLRATE_RANGE
                                 );
                if (Compare.compareDictionaries(resultDict,
                                                ListStreamingParameters,
                                                "RSLT")) {
                    Utilities.print("#VERIFICATION PASSED: "
                                    + "current URI (streaming parameters)"
                                    + " is equal to expected.");
                }
                else {
                    CheckCurrentService.RESULT=false; 
                }          
            };
            CheckCurrentService.manager(["CheckPlayback"])
        },
        "CheckPlayback" : function() {
            if (CheckCurrentService.PLAYBACK != "DNC"){
    //          var playback = de.loewe.sl2.i32.video.format.exist.getValue();
                var playback = de.loewe.sl2.i32.video.info.main.available.getValue();
    //          Utilities.print("!!DEBUG!! playback is " + de.loewe.sl2.i32.video.format.exist.getValue())
                var log = {1: "available", 0: "not available"}
                if (playback == CheckCurrentService.PLAYBACK) {
                    Utilities.print("#VERIFICATION PASSED: playback of "
                        + "current service is " + log[playback] + ".");
                }
                else{
                    Utilities.print("#VERIFICATION FAILED: playback of "
                        + "current service is " + log[playback] + ".");
                    CheckCurrentService.RESULT=false;
                }
            }
            else {
                Utilities.print("INFO: playback verification is not required.");
            }
            CheckCurrentService.manager(['CheckSubtitle'])
        },
        "CheckSubtitle" : function() {
            if (CheckCurrentService.SUBTITLE != "DNC"){
                if (CheckCurrentService.SUBTITLE.hasOwnProperty("exist")){
                    var obj = {
                        api: de.loewe.sl2.i32.tvservice.subtitle.exist,
                        description: "availability of subtitles are in the stream"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.SUBTITLE.exist, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.SUBTITLE.hasOwnProperty("index")){
                    obj = {
                        api: de.loewe.sl2.i32.tvservice.subtitle.index,
                        description: "active subtitle index"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.SUBTITLE.index, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.SUBTITLE.hasOwnProperty("languageFavoured")){
                    obj = {
                        api: de.loewe.sl2.i32.language.subtitle.favoured,
                        description: "favoured subtitle language"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.SUBTITLE.languageFavoured, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.SUBTITLE.hasOwnProperty("languageAlternative")){
                    obj = {
                        api: de.loewe.sl2.i32.language.subtitle.alternative,
                        description: "alternative subtitle language"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.SUBTITLE.languageAlternative, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.SUBTITLE.hasOwnProperty("table")){
                    var api = de.loewe.sl2.tvservice.subtitle.table;
                    var request = {  
                        selections:   [ { field: 0, conditionType: 2, condition: ""}],
                        fields:       [0,1,2,3,4,5],
                        orders:       [ {field: 0, direction: 1} ]
                    }

                    Utilities.getTableValues(
                        function (subtitleTable) {
                            Utilities.print("Comparing subtitle table..."); 
                            function makeIndex(line) {
                                return line[0];
                            }
// Headers for result pretty printing
                            var logLabels = ["\tid", "Name", "ISO639",
                                                 "TYPE", "PURPOSE", "TTXPAGE"];

                            var actualResult = Compare.makeDictionary(
                                CheckCurrentService.SUBTITLE.table,
                                subtitleTable,
                                makeIndex
                            );
                            if(!Compare.compareDictionaries(actualResult, logLabels)){
                                CheckCurrentService.RESULT=false
                            }
                            CheckCurrentService.manager(['CheckAudio']);
                            
                        },
                        api,
                        request,
                        function () {
                            Utilities.print("INFO: verification of subtitle table"
                                + " is not required.");
                            CheckCurrentService.manager(['CheckAudio']) 
                        }
                    )
                }
                else {
                    CheckCurrentService.manager(['CheckAudio']) 
                }
            }
            else {
                Utilities.print("INFO: subtitle verification is not required.");
                CheckCurrentService.manager(['CheckAudio']) 
            }
        },
        "CheckAudio" : function() {
            if (CheckCurrentService.AUDIO != "DNC"){
                if (CheckCurrentService.AUDIO.hasOwnProperty("exist")){
                    var obj = {
                        api: de.loewe.sl2.i32.tvservice.audio.exist,
                        description: "availability of audio are in the stream"
                    };

                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.AUDIO.exist, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.AUDIO.hasOwnProperty("index")){
                    obj = {
                        api: de.loewe.sl2.i32.tvservice.audio.index,
                        description: "active audio index"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.AUDIO.index, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.AUDIO.hasOwnProperty("languageFavoured")){
                    obj = {
                        api: de.loewe.sl2.i32.language.audio.favoured,
                        description: "favoured audio language"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.AUDIO.languageFavoured, "RSLT")){
                        CheckCurrentService.RESULT=false    
                    }
                }
                if (CheckCurrentService.AUDIO.hasOwnProperty("languageAlternative")){
                    obj = {
                        api: de.loewe.sl2.i32.language.audio.alternative,
                        description: "alternative audio language"
                    };
                    if (!Utilities.getCheckAPIValue(obj, CheckCurrentService.AUDIO.languageAlternative, "RSLT")){
                        CheckCurrentService.RESULT=false
                    }
                }
                if (CheckCurrentService.AUDIO.hasOwnProperty("table")){
                    var api = de.loewe.sl2.tvservice.audio.table;
                    var request = {  
                        selections:   [ { field: 0, conditionType: 2, condition: ""}],
                        fields:       [0,1,2,3,4,5],
                        orders:       [ {field: 0, direction: 1} ]
                    }

                    Utilities.getTableValues(
                        function (audioTable) {
                            Utilities.print("Comparing audio table..."); 
                            function makeIndex(line) {
                                return line[0];
                            }
// Headers for result pretty printing
                            var logLabels = ["\tid", "Name", "ISO639",
                                                 "TYPE", "PURPOSE", "TTXPAGE"];

                            var actualResult = Compare.makeDictionary(
                                CheckCurrentService.AUDIO.table,
                                audioTable,
                                makeIndex
                            );
                            
                            if(!Compare.compareDictionaries(actualResult, logLabels)){
                                CheckCurrentService.RESULT=false
                            }
                            CheckCurrentService.manager(['EndTest']);
                            
                        },
                        api,
                        request,
                        function () {
                            Utilities.print("INFO: verification of audio table"
                                + " is not required.");
                            CheckCurrentService.manager(['EndTest'])    
                        }
                    )
                }
                else {
                    CheckCurrentService.manager(['EndTest'])    
                }
            }
            else {
                Utilities.print("INFO: audio verification is not required.");
                CheckCurrentService.manager(['EndTest'])    
            }
        },
        "EndTest" : function(){
            CheckCurrentService.END(CheckCurrentService.RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
