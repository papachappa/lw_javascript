include('../Utilities.js');
include('../Messages.js');
include('../Structures.js');
include('../Timer.js');
include('../PressButton.js');
include('../Enumerators.js');

init = function () {

/** @namespace
 * Test script for set TV to standby 
 * @requires Library: {@link Utilities}, {@link Messages}, {@link Structures}, 
 * {@link Timer}, {@link PressButton}
 */
ToStandby = {

SLEEP: 300,
EPG: 0,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},
/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ToStandby
 * 
 * @param {number} sleep
 * Timeout after set TV to standby till TV wakes up.
 * 
 * @param {number} epg
 * Activate (1) or not activate (0) epg night update during night DCM update process.
 *
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set ToStandby.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (sleepDuration,
                     activateEPG,
                     exitFunc
                    ) {
    if ( typeof(exitFunc) !== "function") {
         ToStandby.END = function(){            
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        }
    }
    else {
        ToStandby.END = exitFunc             
    }
    
    if ( typeof(activateEPG) != "undefined"
         || activateEPG != "" ) {
        ToStandby.EPG = activateEPG;
    }
    else {
        Utilities.print("\nINFO: EPG will not be activated");
    }
    
    if ( typeof(sleepDuration) != "undefined"
         || sleepDuration != "" ) {
        ToStandby.SLEEP = sleepDuration;
    }
    else {
        Utilities.print("INFO: Default sleep duration is 5 mins");
    }
                            
    if ( typeof(exitFunc) == "function") {
        ToStandby.manager(["ActivateEPG"])
    }
    else {
        ToStandby.manager(["Connect"])               
    }
},
/**
 * Set TV to standby with or without epg update activation
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ToStandby
 * {@link Utilities}, {@link Messages}, {@link Structures},
 * {@link Timer}, {@link PressButton}
 */
manager: function (args) {

    var steps = {
        "Connect" : function() {
            Utilities.connectToTV(function(){ ToStandby.manager(["ActivateEPG"]); });
        },
        "ActivateEPG" : function(){
            if ( ToStandby.EPG == 1 ){
            
            var epgInitialInstallTVOBJ = {
                api: de.loewe.sl2.i32.epg.initial.install,
                description: "activation of EPG night update for TV services",
                operatingValue: 0
            }
            
            var epgInitialInstallRadioOBJ = {
                api: de.loewe.sl2.i32.epg.initial.install.radio,
                description: "activation of EPG nigth update for Radio services",
                operatingValue: 0
            }
                        
            Structures.delayedCheck(epgInitialInstallTVOBJ, 
                         2000,
                         function(){
                            Utilities.print("#VERIFICATION PASSED: EPG for TV services is activated"); 
                                Structures.delayedCheck(epgInitialInstallRadioOBJ, 
                                 2000,
                                 function(){
                                    Utilities.print("#VERIFICATION PASSED: EPG for Radio services is activated"); 
                                    ToStandby.manager(["SetTimerToWakeUp"])
                                    },
                                 function(){
                                     Utilities.print("#VERIFICATION FAILED: EPG for Radio services is NOT activated");
                                     ToStandby.manager(["EndTest"]) 
                                    }
                                 )
                                epgInitialInstallRadioOBJ.api.setValue(0);
                            },
                         function(){
                             Utilities.print("#VERIFICATION FAILED: EPG for TV services is NOT activated");
                             ToStandby.manager(["EndTest"]) 
                            }
                         )
            //Reset night epg update
            Utilities.print("Reset night epg update");
            epgInitialInstallTVOBJ.api.setValue(0);

            }
            else {
                ToStandby.manager(["SetTimerToWakeUp"]) 
            }
        },
        "SetTimerToWakeUp" : function(){
            Timer.setAlarmOnceTimer(function(){ ToStandby.manager(["SwitchOffTV"]); },
                                    function(){ ToStandby.manager(["EndTest"]); },
                                    MediaType.TV,
                                    ToStandby.SLEEP);
        },
        "SwitchOffTV" : function(){
            Utilities.print("Transfer TV to standby by pressing Power RC button...");
            PressButton.singlePress(Key.OFF);
            ToStandby.manager(["EndTest"])
        },
        "EndTest" : function() {
            Utilities.print("Test finished.");
            Utilities.endTest()
        }
    };
    
    steps[args[0]](args.splice(1, 1));
}

}

}
