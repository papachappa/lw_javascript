include('../Utilities.js');
include('../ChannelChange.js');

init = function () {

/** @namespace
* Test script to check user zaps and playback ability for list of services.
* P+,P- and direct zap can be executed
* @requires Library: {@link Utilities}, {@link ChannelChange}
*/
UserZapCheckPlayback = {

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
 * @memberof UserZapCheckPlayback
 *
 * @param {object} channelList
 * Structure describing services that should be checked for playback.
 * Each services should be described with parameters:
 *  - servicesList: name of services list where channel should be found.
 *  - mediaType: media type of required services (4- TV, 8-radio) 
 *  - initialChannelNumber: channel change that should be executed 
 *    as percondition (media type and service list is the same as for
 *    tested service) if parameter is omitted or "", channel change will 
 *    not be executed
 *  - channelNumber: channel number for tested zap.
 *    Valid values: "P+", "P-" and channel number direct zap 
 *    if parameter is omitted or "", channel change will not be executed
 *  - resultChannelNumber: channel number where zap should be executed.
 *    if parameter is omitted or "", channelNumber will be expected 
 *    as result channel
 *  - playback: playback ability (1 - available, 0 - not available)
 *    if parameter is omitted or "", playback will not be checked
 * See teamplate UserZapCheckPlayback for example of input parameters
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set UserZapCheckPlayback will be executed as test step,
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
        UserZapCheckPlayback.CHANNELS = channelList
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
        UserZapCheckPlayback.END=exitFunc;
        UserZapCheckPlayback.manager(["Zap"])
    }
    else {
        UserZapCheckPlayback.END = function(){          
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        };
        UserZapCheckPlayback.manager(["Connect"])
    }
},

/**
 * Check playback ability for all listed channels
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof UserZapCheckPlayback
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
							+ "channel change was executed correctly.");
            Utilities.print("4. Go to step 2 and check next channel.")
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                UserZapCheckPlayback.manager(["PreconZap"]);
            });
        },
        "PreconZap" : function() {
            if (UserZapCheckPlayback.CHANNELS.length > 0) {
                UserZapCheckPlayback.WORKING 
                        = UserZapCheckPlayback.CHANNELS[0];
                UserZapCheckPlayback.CHANNELS 
                        = UserZapCheckPlayback.CHANNELS.slice(1)
                Utilities.print("---------------------------------")
                if (typeof(UserZapCheckPlayback.WORKING.channelNumber) 
                            == "number"){
                    Utilities.print("Check direct zap to channel number "
                    + UserZapCheckPlayback.WORKING.channelNumber
                    + " in service list '" 
                    + UserZapCheckPlayback.WORKING.servicesList
                    + "'.");
                }
                else {
                    Utilities.print("Check " 
                    + UserZapCheckPlayback.WORKING.channelNumber +
                    " zap in service list '" 
                    + UserZapCheckPlayback.WORKING.servicesList
                    + "'.");
                } 
                if (UserZapCheckPlayback.WORKING.hasOwnProperty("initialChannelNumber") 
                    && typeof(UserZapCheckPlayback.WORKING.initialChannelNumber)
                        !== "undefined" 
                    && UserZapCheckPlayback.WORKING.initialChannelNumber !== "") 
                {   
                    Utilities.print( "Zap to initial service from '"
                                + UserZapCheckPlayback.WORKING.servicesList 
                                + "' service list.");   
                    ChannelChange.zapWithVerification( 
                        function(){
                            Utilities.print("#VERIFICATION PASSED: "
                                + "Initial channel change"
                                + " was executed successfully." );
                            UserZapCheckPlayback.manager(["UserZap"])
                        },
                        UserZapCheckPlayback.WORKING.initialChannelNumber,
                        UserZapCheckPlayback.WORKING.mediaType,                            
                        UserZapCheckPlayback.WORKING.servicesList,
                        function(){
                            UserZapCheckPlayback.RESULT=false;
                            Utilities.print("#VERIFICATION FAILED: "
                                + "Initial channel change"
                                + " was not executed successfully."
                                + " Check next channel.");
                            UserZapCheckPlayback.manager(["PreconZap"])
                        })
                }
                else {
                    Utilities.print("Initial channel change is not required.");
                    UserZapCheckPlayback.manager(["UserZap"]);
                }
            }
            else {
                Utilities.print("All required services are checked.")
                UserZapCheckPlayback.manager(['EndTest'])    
            }
        },
        "UserZap" : function(){
            if (typeof(UserZapCheckPlayback.WORKING.channelNumber)
                        !== "undefined" &&
                   UserZapCheckPlayback.WORKING.channelNumber !== "") {  
                if ( !UserZapCheckPlayback.WORKING
                            .hasOwnProperty("resultChannelNumber")) 
                {
                    UserZapCheckPlayback.WORKING.resultChannelNumber = ""   
                }    
                ChannelChange.userZapWithVerification( 
                    function(){
                        UserZapCheckPlayback.manager(["CheckServiceParameters"])
                    },
                    UserZapCheckPlayback.WORKING.channelNumber,
                    UserZapCheckPlayback.WORKING.mediaType,       
                    UserZapCheckPlayback.WORKING.servicesList,
                    UserZapCheckPlayback.WORKING.resultChannelNumber,
                    function(){
                        UserZapCheckPlayback.RESULT=false;
                        Utilities.print( "Check next channel.");
                        UserZapCheckPlayback.manager(["PreconZap"])
                    } 
                )
            }
            else {
                Utilities.print("Channel change is not required.");
                UserZapCheckPlayback.manager(["CheckServiceParameters"]);
            }
        },
        "CheckServiceParameters" : function() {
            if ( UserZapCheckPlayback.WORKING.hasOwnProperty("playback") 
                && UserZapCheckPlayback.WORKING.playback !== ""){
                window.setTimeout(function(){
//check type of current service
				var RadioOrTV = de.loewe.sl2.vstr.tvservice.play.main.getValue();
				var activeTV = RadioOrTV[6];
				if (String(activeTV) == 1) {
					var string = de.loewe.sl2.vstr.tvservice.play.main.getValue()
				}
				else {
					var string = de.loewe.sl2.vstr.tvservice.play.radio.getValue()
				}
//check Name of current service
				var resultName = string[5];
				if (UserZapCheckPlayback.WORKING.hasOwnProperty("resultName")) {
					if (String(resultName) === UserZapCheckPlayback.WORKING.resultName) {
						Utilities.print("#VERIFICATION PASSED: '" + resultName + "' is correct"
										+ " name of playing service");
					}
					else {
						Utilities.print("#VERIFICATION FAILED: '" + resultName + "' is incorrect"
										+ " name of playing service. That's different"
										+ " from expected '" + UserZapCheckPlayback.WORKING.resultName + "'.");
					}
				}
				else {
					Utilities.print("INFO: name of playing service '" + resultName + "' is displayed.");
				}
//check Number of current service
				var resultNumber = string[2];
				if (UserZapCheckPlayback.WORKING.hasOwnProperty("resultNumber")) {
					if (Number(resultNumber) === UserZapCheckPlayback.WORKING.resultNumber) {
						Utilities.print("#VERIFICATION PASSED: " + resultNumber + " is correct"
										+ " number of playing service");
					}
					else {
						Utilities.print("#VERIFICATION FAILED: " + resultNumber + " is incorrect"
										+ " number of playing service. That's different"
										+ " from expected " + UserZapCheckPlayback.WORKING.resultNumber + ".");
					}
					}	
				else {
					Utilities.print("INFO: number of playing service " + resultNumber + " is displayed.");
				}					
//check Playback & Message ID of current service
				var log = {1: "available", 0: "not available"}
				if (UserZapCheckPlayback.WORKING.mediaType == 4){
                    Utilities.print("INFO: playback verification for"
                                        + " TV service is executed by "
                                        + "checking video format.");
                    var playback = de.loewe.sl2.i32.video.info.main.available.getValue();
				}
				else {
                    var message = de.loewe.sl2.messages.messageid.getValue();
                    Utilities.print("INFO: playback verification for"
                                    + " radio service is executed by "
                                    + "checking displayed messages.");
                    if (message == 0) {
                        var playback = 1;
                        Utilities.print("INFO: no messages are displayed");
                    }
                    else {
                        var playback = 0;
                        Utilities.print("INFO: message with id = "
                                        + message + " is displayed");
                    }                    
				}
				if (playback == UserZapCheckPlayback.WORKING.playback) {
					Utilities.print("#VERIFICATION PASSED: playback of "
									+ "service '" + resultName + "' is " + log[playback] + ".");
				}
				else {
					Utilities.print("#VERIFICATION FAILED: playback of "
									+ "service '" + resultName + "' is " + log[playback] + ".");
					UserZapCheckPlayback.RESULT=false;
				}					
				UserZapCheckPlayback.manager(["PreconZap"])
				}, 7000)  
            }
            else{
                Utilities.print("Playback verification is not required.");
                UserZapCheckPlayback.manager(["PreconZap"])
            }
        },
        "EndTest" : function(){
            UserZapCheckPlayback.END(UserZapCheckPlayback.RESULT);
        }
    };
    
    steps[args[0]](args.splice(1, 1));
}


}
}
