include('../Utilities.js');
include('../Timer.js');

init = function () {

/** @namespace
* Test script for Time Verification
* @requires Library: {@link Utilities}, {@link Scan}
*/
TimeVerification = {

UTC_TIME: "",
ZONE: "",
NEW_ZONE: "",
UPDATE_TIME: "",
ERROR: 0,
TEST_RESULT: true,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof InitialScan
 *
 * @param {number} [UTC_TIME]
 * UTC time. Parameter will not be checked if not set
 * 
 * @param {number} [time_error]
 * acceptable error in seconds
 * 
 * @param {number} [time_zone]
 * Time zome in sec. Parameter will not be checked if not set.
 * Available values [-43200, 50400]
 * 
 * @param {number} [update_time]
 * UTC time when zome should be update.
 * 
 * @param {number} [new_zone]
 * New time zome in sec. Parameter will not be checked if not set.
 * Available values [-43200, 50400]
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (UTC_TIME,
                     time_error,
                     time_zone,
                     update_time,
                     new_zone,
                     exitFunc) {

    if ( typeof(UTC_TIME) == "undefined"
         || UTC_TIME === "" ) {
        Utilities.print("WARN: Time is not set, so it won't be checked.");
        TimeVerification.UTC_TIME = "";
    }
    else {
        TimeVerification.UTC_TIME = UTC_TIME;
        if ( typeof(time_error) == "undefined"
             || time_error === "" 
             || time_error == 0 ) {
            Utilities.print("WARN: Acceptable error is not defined.");
            TimeVerification.ERROR = 0;
        }
        else {
            TimeVerification.ERROR = time_error;
        }
    }
    
    if ( typeof(time_zone) == "undefined"
         || time_zone === "" ) {
        Utilities.print("WARN: Time zone is not set, so it won't be checked.");
        TimeVerification.ZONE = "";
    }
    else {
        TimeVerification.ZONE = time_zone;
    }
    
    if ( typeof(update_time) == "undefined"
         || update_time === "" ) {
        Utilities.print("WARN: Time of zone update is not set,"
                        + " so it won't be checked.");
        TimeVerification.UPDATE_TIME = "";
    }
    else {
        TimeVerification.UPDATE_TIME = update_time;
    }
    
    if ( typeof(new_zone) == "undefined"
         || new_zone === "" ) {
        Utilities.print("WARN: New time zone is not set, "
                        + "so it won't be checked.");
        TimeVerification.NEW_ZONE = "";
    }
    else {
        TimeVerification.NEW_ZONE = new_zone;
    }

    if ( typeof(exitFunc) == "function") {
        TimeVerification.END = exitFunc;
        TimeVerification.manager(["CheckTime"]);
    }
    else {
        TimeVerification.manager(["Connect"]);
    }

},

/**
 * Executor of time verification
 * and scan result verification.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof InitialScan
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Check UTC TV time with error considering.");
            Utilities.print("3. Check TV time zone.");
            Utilities.print("4. Check time of zone update.");
            Utilities.print("5. Check new time zone.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                    TimeVerification.manager(["CheckTime"]); 
                });
        },
        "CheckTime" : function(){
            if (TimeVerification.UTC_TIME !== ""){
                if (Timer.checkTime(TimeVerification.UTC_TIME, 
                                    TimeVerification.ERROR)) {
                    Utilities.print("#VERIFICATION PASSED: TV time is "
                                    + "equal to expected.");    
                }
                else{
                    Utilities.print("#VERIFICATION FAILED: TV time is not "
                                    + "equal to expected.");
                    TimeVerification.TEST_RESULT = false
                }
            }
            TimeVerification.manager(["CheckZone"])
        },
        "CheckZone" : function(){
            if (TimeVerification.ZONE !== "") {
                if (!Timer.checkTimeZone(TimeVerification.ZONE)) {
                    TimeVerification.TEST_RESULT = false;
                }
            }
            TimeVerification.manager(["CheckUpdateTime"])    
        },
        "CheckUpdateTime" : function(){
            if (TimeVerification.UPDATE_TIME !== "") {
                if (!Timer.checkTimeZoneUpdate(TimeVerification.UPDATE_TIME)) {
                    TimeVerification.TEST_RESULT = false;
                }
            }
            TimeVerification.manager(["CheckNewZone"])    
        },
        "CheckNewZone" : function(){
            if (TimeVerification.NEW_ZONE !== "") {
                if (!Timer.checkNewTimeZone(TimeVerification.NEW_ZONE)) {
                    TimeVerification.TEST_RESULT = false;
                }
            }
            TimeVerification.manager(["EndTest"])    
        },
        "EndTest" : function(){
            TimeVerification.END(TimeVerification.TEST_RESULT = false);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}

}
