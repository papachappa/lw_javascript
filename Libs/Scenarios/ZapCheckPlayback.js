include('../Utilities.js');
include('../ChannelChange.js');

init = function () {

/** @namespace
* Test script to check playback ability for list of services.
* @requires Library: {@link Utilities}, {@link ChannelChange}
*/
ZapCheckPlayback = {

CHANNELS: [],
WORKING: {},
END: function(){
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },
RESULT:true,

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ZapCheckPlayback
 *
 * @param {object} channelList
 * Structure describing services that should be checked for playback.
 * Each services should be described with parameters:
 *  - servicesList: name of services list where channel should be found.
 *  - channelNumber: channel number where channel change should be executed.
 *    if parameter is omitted, channel change will not be executed
 *  - mediaType: media type of required services (4- TV, 8-radio)
 *  - playback: playback ability (1 - available, 0 - not available)
 *
 * @param {function} [exitFunc = function(){
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set ZapCheckPlayback will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished
 * with result printing after verification of list creation will be executed.
 *
 * @requires Library: {@link Utilities}
 */
startTest: function (channelList,
                     exitFunc) {

    if (typeof(channelList) != "undefined"
    && channelList != ""
    && channelList.length != 0){
        ZapCheckPlayback.CHANNELS = channelList
    }
    else{
        Utilities.print("#ERROR: input parameter channelList is not "
                        + "specified as required current library.");
        if ( typeof(exitFunc) != "undefined" && exitFunc != "") {
            exitFunc(false);
        }
        else {
            Utilities.print("Test finished.");
            Utilities.print("TEST_FAILED");
            setTimeout(jbiz.exit,1000)
        }
    }

    if ( typeof(exitFunc) != "undefined" && exitFunc != "") {
        ZapCheckPlayback.END=exitFunc;
        ZapCheckPlayback.manager(["Zap"])
    }
    else {
        ZapCheckPlayback.END = function(){
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        };
        ZapCheckPlayback.manager(["Connect"])
    }
},

/**
 * Check playback ability for all listed channels
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ZapCheckPlayback
 * @requires Library: {@link Utilities}, {@link ChannelChange}
 */


manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Execute channel change if it is required"
                            + " by test.");
            Utilities.print("3. Check playback of current service if "
                    +   "channel change was executed correctly.");
            Utilities.print("4. Go to step 2 and check next channel.")
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                ZapCheckPlayback.manager(["Zap"]);
            });
        },
        "Zap" : function() {
            if (ZapCheckPlayback.CHANNELS.length > 0) {
                ZapCheckPlayback.WORKING
                        = ZapCheckPlayback.CHANNELS[0];
                ZapCheckPlayback.CHANNELS
                        = ZapCheckPlayback.CHANNELS.slice(1)
                if (typeof(ZapCheckPlayback.WORKING.channelNumber)
                        !== "undefined" &&
                   ZapCheckPlayback.WORKING.channelNumber !== "")
                   {
                    Utilities.print(" Check service with channel number "
                                    + ZapCheckPlayback.WORKING.channelNumber
                                    + " from service list '"
                                    + ZapCheckPlayback.WORKING.servicesList
                                    + "'.");
                     ChannelChange.zapWithVerification(
                            function(){ZapCheckPlayback.
                                            manager(["CheckServiceParameters"])},
                            ZapCheckPlayback.WORKING.channelNumber,
                            ZapCheckPlayback.WORKING.mediaType,
                            ZapCheckPlayback.WORKING.servicesList,
                            ZapCheckPlayback.WORKING.resultName,
                            ZapCheckPlayback.WORKING.resultNumber,
                            ZapCheckPlayback.WORKING.playback,
                            ZapCheckPlayback.WORKING.messageID,
                            function(){
                                ZapCheckPlayback.RESULT=false;
                                Utilities.print("#VERIFICATION FAILED: "
                                    + "Channel change"
                                    + " was not executed successfully."
                                    + " Check next channel.");
                                ZapCheckPlayback.manager(["Zap"])
                            }
                        )
                    }
                else if (typeof(ZapCheckPlayback.WORKING.channelName)
                        !== "undefined" &&
                   ZapCheckPlayback.WORKING.channelName !== "")
                   {
                    Utilities.print(" Check service with channel name "
                                    + ZapCheckPlayback.WORKING.channelName
                                    + " from service list '"
                                    + ZapCheckPlayback.WORKING.servicesList
                                    + "'.");
                     ChannelChange.zapToServiceByName(
                            function(){ZapCheckPlayback.
                                            manager(["CheckServiceParameters"])},
                            ZapCheckPlayback.WORKING.channelName,
                            ZapCheckPlayback.WORKING.mediaType,
                            ZapCheckPlayback.WORKING.servicesList,
                            ZapCheckPlayback.WORKING.resultName,
                            ZapCheckPlayback.WORKING.resultNumber,
                            ZapCheckPlayback.WORKING.playback,
                            ZapCheckPlayback.WORKING.messageID,
                            function(){
                                ZapCheckPlayback.RESULT=false;
                                Utilities.print("#VERIFICATION FAILED: "
                                    + "Channel change"
                                    + " was not executed successfully."
                                    + " Check next channel.");
                                ZapCheckPlayback.manager(["Zap"])
                            }
                        )
                    }
                else {
                    Utilities.print("Channel change is not required.");
                    ZapCheckPlayback.manager(["CheckServiceParameters"]);
                }
            }
            else {
                Utilities.print("All required services are checked.")
                ZapCheckPlayback.manager(['EndTest'])
            }
        },
       	"CheckServiceParameters" : function() {
			window.setTimeout(function(){
//check type of current service
				var RadioOrTV = de.loewe.sl2.vstr.tvservice.play.main.getValue();
				var activeTV = RadioOrTV[6];
				ZapCheckPlayback.WORKING.mediaType = RadioOrTV[6];
				if (String(activeTV) == 1) {
					var string = de.loewe.sl2.vstr.tvservice.play.main.getValue()
				}
				else {
					var string = de.loewe.sl2.vstr.tvservice.play.radio.getValue()
				}
//check Name of current service
				var resultName = string[5];
				if (ZapCheckPlayback.WORKING.hasOwnProperty("resultName")) {
					if (String(resultName) === ZapCheckPlayback.WORKING.resultName) {
						    Utilities.print("#VERIFICATION PASSED: '" + resultName + "' is correct"
                        + " name of playing service");
					}
					else {
						Utilities.print("#VERIFICATION FAILED: '" + resultName + "' is incorrect"
                        + " name of playing service. That's different"
                        + " from expected '" + ZapCheckPlayback.WORKING.resultName + "'.");
					//	ZapCheckPlayback.manager(["Zap"]);
					}
				}
				else {
					Utilities.print("INFO: name of playing service '" + resultName + "' is displayed.");
				}
//check Number of current service
				var resultNumber = string[2];
				if (ZapCheckPlayback.WORKING.hasOwnProperty("resultNumber")) {
					if (Number(resultNumber) === ZapCheckPlayback.WORKING.resultNumber) {
						    Utilities.print("#VERIFICATION PASSED: " + resultNumber + " is correct"
                        + " number of playing service");
					}
					else {
						Utilities.print("#VERIFICATION FAILED: " + resultNumber + " is incorrect"
                        + " number of playing service. That's different"
                        + " from expected " + ZapCheckPlayback.WORKING.resultNumber + ".");
                    //    ZapCheckPlayback.manager(["Zap"]);
					}
				}
				else {
					Utilities.print("INFO: number of playing service " + resultNumber + " is displayed.");
				}
//check Playback of current service
				var messageID = de.loewe.sl2.messages.messageid.getValue();
				if (ZapCheckPlayback.WORKING.hasOwnProperty("playback")) {
					var log = {1: "available", 0: "not available"}
					if (ZapCheckPlayback.WORKING.mediaType == 1){
						Utilities.print("INFO: playback verification for"
											+ " TV service is executed by "
											+ "checking video format.");
						var playback = de.loewe.sl2.i32.video.info.main.available.getValue();
					}
					else if (ZapCheckPlayback.WORKING.mediaType == 0){
						Utilities.print("INFO: playback verification for"
										+ " radio service is executed by "
										+ "checking displayed messages.");
						if (messageID == 0) {
							var playback = 1;
							Utilities.print("INFO: no messages are displayed");
						}
						else {
							var playback = 0;
							Utilities.print("INFO: messages with id = "
											+ messageID + " are displayed");
						}
					}
					else {
						Utilities.print("#ERROR: media type is not determinate correctly.");
						Utilities.print("INFO: media type is " + ZapCheckPlayback.WORKING.mediaType + ".");
					}
					if (playback == ZapCheckPlayback.WORKING.playback) {
						Utilities.print("#VERIFICATION PASSED: playback of "
										+ "service '" + resultName + "' is " + log[playback] + ".");
					}
					else {
						Utilities.print("#VERIFICATION FAILED: playback of "
										+ "service '" + resultName + "' is " + log[playback] + ".");
						ZapCheckPlayback.RESULT=false;
					}
				}
				else {
					Utilities.print("INFO: playback is not verified");
				}
//check MessageID of current service
				if (ZapCheckPlayback.WORKING.hasOwnProperty("messageID")) {
					if (messageID == ZapCheckPlayback.WORKING.messageID) {
						    Utilities.print("#VERIFICATION PASSED: displayed  "
                        + "message id is " + messageID + ".")
					}
					else {
						Utilities.print("#VERIFICATION FAILED: displayed  "
                        + "message id is " + messageID + ", that is different"
                        + " from expected " + ZapCheckPlayback.WORKING.messageID)
					}
				}
				else {
					Utilities.print("INFO: message id is " + messageID + ".");
				}
				ZapCheckPlayback.manager(["Zap"])
            }, 10000)
        },
        "EndTest" : function(){
            ZapCheckPlayback.END(ZapCheckPlayback.RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}
}
}
