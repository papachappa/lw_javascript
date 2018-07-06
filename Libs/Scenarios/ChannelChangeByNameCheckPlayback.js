include('../Utilities.js');
include('../ChannelChange.js');

init = function () {

/** @namespace
* Test script to check playback ability for list of services.
* @requires Library: {@link Utilities}, {@link ChannelChange}
*/
ChannelChangeByNameCheckPlayback = {

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
 * @memberof ChannelChangeByNameCheckPlayback
 *
 * @param {object} channelList
 * Structure describing services that should be checked for playback.
 * Each services should be described with parameters:
 *  - servicesList: name of services list where channel should be found.
 *  - channelName: channel number where channel change should be executed.
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
 * If parameter is set ChannelChangeByNameCheckPlayback will be executed as test step,
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
        ChannelChangeByNameCheckPlayback.CHANNELS = channelList
    }
    else{
        Utilities.print("WARN: input parameter channelList is not "
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
        ChannelChangeByNameCheckPlayback.END=exitFunc;
        ChannelChangeByNameCheckPlayback.manager(["Zap"])
    }
    else {
        ChannelChangeByNameCheckPlayback.END = function(){          
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        };
        ChannelChangeByNameCheckPlayback.manager(["Connect"])
    }
},

/**
 * Check playback ability for all listed channels
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ChannelChangeByNameCheckPlayback
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
                ChannelChangeByNameCheckPlayback.manager(["Zap"]);
            });
        },
        "Zap" : function() {
            if (ChannelChangeByNameCheckPlayback.CHANNELS.length > 0) {
                ChannelChangeByNameCheckPlayback.WORKING 
                        = ChannelChangeByNameCheckPlayback.CHANNELS[0];
                ChannelChangeByNameCheckPlayback.CHANNELS 
                        = ChannelChangeByNameCheckPlayback.CHANNELS.slice(1)       
                if (typeof(ChannelChangeByNameCheckPlayback.WORKING.channelName)
                        !== "undefined" &&
                   ChannelChangeByNameCheckPlayback.WORKING.channelName !== "")
                   {
                    Utilities.print(" Check service with channel name "
                                    + ChannelChangeByNameCheckPlayback.WORKING.channelName
                                    + " from service list '" 
                                    + ChannelChangeByNameCheckPlayback.WORKING.servicesList
                                    + "'.");   
                     ChannelChange.zapToServiceByName( 
                            function(){ChannelChangeByNameCheckPlayback.
                                            manager(["CheckPlayback"])},
                            ChannelChangeByNameCheckPlayback.WORKING.channelName,
                            ChannelChangeByNameCheckPlayback.WORKING.mediaType,                            
                            ChannelChangeByNameCheckPlayback.WORKING.servicesList,
                            function(){
                                ChannelChangeByNameCheckPlayback.RESULT=false;
                                Utilities.print("#VERIFICATION FAILED: "
                                    + "Channel change"
                                    + " was not executed successfully."
                                    + " Check next channel.");
                                ChannelChangeByNameCheckPlayback.manager(["Zap"])
                            } 
                        )
                    }
                else {
                    Utilities.print("Channel change is not required.");
                    
                    ChannelChangeByNameCheckPlayback.manager(["CheckPlayback"]);
                }
            }
            else {
                Utilities.print("All required services are checked.")
                ChannelChangeByNameCheckPlayback.manager(['EndTest'])    
            }
        },
        "CheckPlayback" : function(listUID) {
            if (ChannelChangeByNameCheckPlayback.WORKING.hasOwnProperty("playback")){
                if (ChannelChangeByNameCheckPlayback.WORKING.playback != 'DNC'){
                    window.setTimeout(function(){
                        // var playback = de.loewe.sl2.i32.video.info.main.available.getValue();
                        var playback = de.loewe.sl2.i32.video.format.exist.getValue();
                        var log = {1: "available", 0: "not available"}
                            if (playback == ChannelChangeByNameCheckPlayback.WORKING.playback) {
                                Utilities.print("#VERIFICATION PASSED: playback of "
                                    + "current service is " + log[playback] + ".");
                            }
                            else{
                                Utilities.print("#VERIFICATION FAILED: playback of "
                                    + "current service is " + log[playback] + ".");
                                ChannelChangeByNameCheckPlayback.RESULT=false;
                            }
                        ChannelChangeByNameCheckPlayback.manager(["Zap"])
                    }, 7000)
                }
            }
            ChannelChangeByNameCheckPlayback.manager(["Zap"])

        },
        "EndTest" : function(){
            ChannelChangeByNameCheckPlayback.END(ChannelChangeByNameCheckPlayback.RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}


}
}
