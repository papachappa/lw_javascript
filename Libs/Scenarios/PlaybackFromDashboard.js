include('../Utilities.js');
include('../Dashboard.js');
include('../ChannelChange.js');

init = function () {

/** @namespace
* Test script to check playback ability for services from dashboard.
* @requires Library: {@link Utilities}, {@link ChannelChange}
*/
PlaybackFromDashboard = {

ITEMS: [],
WORKING: {},
DASHBOARD:[],
END: function(){            
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },
RESULT:true,

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof PlaybackFromDashboard
 *
 * @param {object} itemsList
 * Structure describing services that should be checked for playback.
 * Each services should be described with parameters:
 *  - itemIndex: index of item on dashboard (started from 1).
 *  - playback: playback ability (1 - available, 0 - not available)
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set PlaybackFromDashboard will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (itemsList,
                     exitFunc) {

    if (typeof(itemsList) != "undefined"
    && itemsList != ""
    && itemsList.length != 0){
        PlaybackFromDashboard.ITEMS = itemsList
    }
    else{
        Utilities.print("WARN: input parameter itemsList is not "
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
        PlaybackFromDashboard.END=exitFunc;
        PlaybackFromDashboard.manager(["GetDashboard"])
    }
    else {
        PlaybackFromDashboard.END = function(){
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        };
        PlaybackFromDashboard.manager(["Connect"])
    }

},

/**
 * Check playback ability for all listed items
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof PlaybackFromDashboard
 * @requires Library: {@link Utilities}, {@link ChannelChange}
 */

 
manager: function (args) {
    var reg = /onid=\d+&sid=\d+&tsid=\d+/;//DVB triplet
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get current dashboard.");
            Utilities.print("3. Execute item selection.");
            Utilities.print("4. Check playback.");
            Utilities.print("5. Go to step 3 and check next channel.")
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                PlaybackFromDashboard.manager(["GetDashboard"]);
            });
        },
        "GetDashboard" : function() {
            Dashboard.getFilteredServicesFromDashboard(
                function(services){
                    PlaybackFromDashboard.manager(["GlobalDashboard",services]);
                },
//no filters, ger all services
                {},
                [29,2,6,4]);    
        },
        "GlobalDashboard" : function(services) {
//FIXME: quick and dirty this step only save service in global context
            PlaybackFromDashboard.DASHBOARD = services[0];
            PlaybackFromDashboard.manager(["SelectService"]);
        },
        "SelectService" : function(services) {
            if (PlaybackFromDashboard.ITEMS.length > 0) {
                PlaybackFromDashboard.WORKING 
                        = PlaybackFromDashboard.ITEMS[0];
                PlaybackFromDashboard.ITEMS 
                        = PlaybackFromDashboard.ITEMS.slice(1);
                if (PlaybackFromDashboard.WORKING.itemIndex != "DNC") {
                    if ( PlaybackFromDashboard.WORKING.itemIndex >= PlaybackFromDashboard.DASHBOARD.length) {                                          
                        PlaybackFromDashboard.RESULT=false;
                        Utilities.print("#VERIFICATION FAILED: Requested item "
                            + PlaybackFromDashboard.WORKING.itemIndex
                            + "is not present is dashboard."
                            + "Dashboard contanes "
                            + PlaybackFromDashboard.DASHBOARD.lenght
                            + "items.")
                        PlaybackFromDashboard.manager(["SelectService"]);
                    }; 
                    Utilities.print("Select item "
                        + PlaybackFromDashboard.WORKING.itemIndex
                        + " '" 
                        + PlaybackFromDashboard.
                            DASHBOARD[PlaybackFromDashboard.WORKING.itemIndex-1][2]
                        + "' from dashboard."); 
                    expDvbTriplet =  String(reg.exec(PlaybackFromDashboard.
                            DASHBOARD[PlaybackFromDashboard.WORKING.itemIndex-1][3]));
                    ChannelChange.zapToService( 
                            //exitfunction
                            function(){PlaybackFromDashboard.
                                            manager(["CheckZap"])},
                            //UUID
                            PlaybackFromDashboard.
                            DASHBOARD[PlaybackFromDashboard.WORKING.itemIndex-1][0],
                            //channel number
                            "-1",
                            //type
                            PlaybackFromDashboard.
                            DASHBOARD[PlaybackFromDashboard.WORKING.itemIndex-1][1], 
                            //listUID
                            "",                           
                            //failfunction
                            function(){
                                PlaybackFromDashboard.RESULT=false;
                                Utilities.print("#VERIFICATION FAILED: "
                                    + "Channel change"
                                    + " was not executed successfully."
                                    + " Check next channel.");
                                PlaybackFromDashboard.manager(["SelectService"])
                            } 
                        );
                    }
                else {                   
                    PlaybackFromDashboard.manager(["CheckPlayback"]);
                }
            }
            else {
                Utilities.print("All required services are checked.")
                PlaybackFromDashboard.manager(['EndTest'])    
            }
        },
        "CheckZap" : function() {
            var currentChannel = de.loewe.sl2.tvservice
                .uri.main.getValue();
            if (String(reg.exec(currentChannel)) == expDvbTriplet ) {
                Utilities.print("INFO: Channel "
                                + " change executed correctly, DVB triplet"
                                + " is equal to expected.");
                            
                PlaybackFromDashboard.manager(["CheckPlayback"]);
            }
            else {
                Utilities.print("#VERIFICATION FAILED: DVB triplet"
                                + " is NOT equal to expected.");
                PlaybackFromDashboard.RESULT=false;
                PlaybackFromDashboard.manager(["SelectService"]);
            }
            },
        "CheckPlayback" : function(listUID) {
            if (PlaybackFromDashboard.WORKING.playback != "DNC"){
            Utilities.print("Check playback for current item.");
            window.setTimeout(function(){
                //var playback = de.loewe.sl2.i32.video.format.exist.getValue();
                var playback = de.loewe.sl2.i32.video.info.main.available.getValue();
                var log = {1: "available", 0: "not available"}
                if (playback == PlaybackFromDashboard.WORKING.playback) {
                    Utilities.print("#VERIFICATION PASSED: playback of "
                        + "current service is " + log[playback] + ".");
                }
                else{
                    Utilities.print("#VERIFICATION FAILED: playback of "
                        + "current service is " + log[playback] + ".");
                    PlaybackFromDashboard.RESULT=false;
                }
                PlaybackFromDashboard.manager(["SelectService"])
            }, 7000)
            }
            else {
                PlaybackFromDashboard.manager(["SelectService"]);
            }

        },
        "EndTest" : function(){
            PlaybackFromDashboard.END(PlaybackFromDashboard.RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
