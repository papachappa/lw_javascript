include('../Utilities.js');
include('../ChannelChange.js');
include('../ParentalControl.js');
include('../Structures.js');

init = function () {

/** @namespace
* Test script to verify parental control access for list of services.
* @requires Library: {@link Utilities}, {@link ChannelChange}
*/
CheckLockedChannels = {

CHANNELS: [],
TEST_RESULT:true,
END: function(){
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckLockedChannels
 *
 * @param {object} channelList
 * Structure describing services that should be checked
 * Each services should be described with parameters:
 *  - servicesList: name of service list where channel should be found.
 *  - channelNumber: channel number of service under test
 *    if parameter is omitted, channel change will not be executed
 *  - mediaType: media type of service under test (4 - TV, 8 - radio)
 *  - isLocked: lock state of service under test (1 - locked, 0 - available)
 *
 * @param {function} [exitFunc = function(){
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set, the CheckLockedChannels will be executed as a test
 * step, i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as a separate test, i.e
 * connection to TV will be called as its first step, the test will be finished
 * with result printing.
 *
 * @requires Library: {@link Utilities}
 */
startTest: function (channelList,
                     exitFunc) {

    if ( typeof(exitFunc) == "function") {
        CheckLockedChannels.END = exitFunc;
    }

    if (Array.isArray(channelList) && channelList.length != 0) {
        CheckLockedChannels.CHANNELS = channelList;
    }
    else {
        Utilities.print("#ERROR: 'channelList' argument has wrong format. See "
                        + "Libs/Templates/CheckLockedChannels.html");
        CheckLockedChannels.END(false);
    }

    if ( typeof(exitFunc) == "function") {
        CheckLockedChannels.manager(["Zap", 0]);
    }
    else {
        CheckLockedChannels.manager(["Connect"]);
    }
},

/**
 * Check service access sate for all channels under test
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckLockedChannels
 * @requires Library: {@link Utilities}, {@link ChannelChange},
 * {@link ParentalControl}, {@link Structures}
 */

manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Execute channel change if it is required"
                            + " by test.");
            Utilities.print("3. Check access to the current channel if "
                            +   "channel change was executed correctly.");
            Utilities.print("4. Repeat steps #2 and #3 for all channels in "
                            + "the list")
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function() {
                CheckLockedChannels.manager(["Zap", 0]);
            });
        },
        "Zap" : function(idx) {
            var idx = idx[0];
            if (idx < CheckLockedChannels.CHANNELS.length) {
                // Short names for properties of the current channel under test
                var channelNumber = CheckLockedChannels.CHANNELS[idx]
                    .channelNumber;
                var mediaType = CheckLockedChannels.CHANNELS[idx]
                    .mediaType;
                var serviceList = CheckLockedChannels.CHANNELS[idx]
                    .serviceList;
                // If channelNumber is integer (or equivalent string)
                if (channelNumber == parseInt(channelNumber, 10)) {
                    Utilities.print("Check service with channel number '"
                                    + channelNumber + "' from service list '"
                                    + serviceList + "'.");
                    ChannelChange.zapWithVerification(
                        function() {
                            CheckLockedChannels.manager(["CheckAccess", idx])},
                            channelNumber,
                            mediaType,
                            serviceList,
                        function() {
                            CheckLockedChannels.TEST_RESULT = false;
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Channel change was not executed"
                                            + " correctly.");
                            CheckLockedChannels.manager(["Zap", idx + 1]);
                        }
                    );
                }
                else {
                    Utilities.print("Channel change is not required.");
                    CheckLockedChannels.manager(["CheckAccess", idx]);
                }
            }
            else {
                Utilities.print("All required services are checked.")
                CheckLockedChannels.manager(['EndTest'])
            }
        },
        "CheckAccess" : function(idx) {
            var pinOSD = de.loewe.sl2.vstr.parental.lock.pin.request;
            var isSoundMuted = de.loewe.sl2.i32.sound.mute.state.getValue();
            var isVideoMuted = de.loewe.sl2.i32.video
                .window0.mute.state.getValue();
            var idx = idx[0];
            // Short names for properties of the current channel under test
            var isLocked = CheckLockedChannels.CHANNELS[idx].isLocked;
            // TODO: Verify that there is no delay between channel change and
            // content mute
            function checkMute(val, content){
                function verboseMute (state) {
                    return (state == 1)? "muted" : "available";
                }
                if (val == isLocked) {
                    Utilities.print("#VERIFICATION PASSED: " + content
                                    + " for the current channel is "
                                    + verboseMute(val) + ".");
                }
                else {
                    CheckLockedChannels.TEST_RESULT = false;
                    Utilities.print("#VERIFICATION FAILED: " + content
                                    + " for the current channel is "
                                    + verboseMute(val) + ".");
                }
            }

            function verboseState (state) {
                return (state == 1)? "locked" : "available";
            }

            function exitFn() {
                var currentState = ParentalControl.checkPINrequest();
                if ( currentState == isLocked) {
                    Utilities.print("#VERIFICATION PASSED: The current channel "
                                    + "is " + verboseState(currentState)
                                    + ".");
                }
                else {
                    CheckLockedChannels.TEST_RESULT = false;
                    Utilities.print("#VERIFICATION FAILED: The current channel "
                                    + "is " + verboseState(currentState)
                                    + ".");
                }
                CheckLockedChannels.manager(["Zap", idx + 1])
            }

            checkMute(isSoundMuted, "Audio");
            checkMute(isVideoMuted, "Video");
            // Default time-out 3000 sec verified on FreeView (increase if
            // it's too small for M7)
            Structures.delayedListener(pinOSD, exitFn);
        },
        "EndTest" : function(){
            CheckLockedChannels.END(CheckLockedChannels.TEST_RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}


}
}
