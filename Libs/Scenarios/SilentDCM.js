include('../Utilities.js');
include('../Scan.js');
include('../ChannelChange.js');
include('../Messages.js');
include('../Scenarios/CheckServiceList.js');

init = function () {

/** @namespace
 * Test script for verification result of silent DCM 
 * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
 * {@link ChannelChange}, {@link CheckServiceList}
 */
SilentDCM = {

DCM_CHANNEL: [],
LIST_NAME: "overall",
SERVICELIST: [],
TIMEOUT: 0,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},
/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof SilentDCM
 *
 * @param {array} DCMchannel
 * Channel where DCM result should be checked
 * <br/> [channel number, media type, name of service list]
 * Channel change won't be executed  if channel is "" or []
 * 
 * @param {number} timeout
 * Timeout after channel change before verify result of DCM 
 * 
 * @param {string} listName
 * Name of service list that should be checked for verification DCM result.
 * Overall list will be checked if name is not set
 * 
 * @param {array} serviceList
 * Name of service list that should be checked for verification DCM result
 * Each service should described in format:
 * <br/> [Name, ChNum, ServiceID, StreamID, NetID, Type, Visibility, Selectability]
 *
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set SilentDCM.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (DCMchannel,
                     timeout,
                     listName,
                     serviceList,
                     exitFunc
                    ) {
    if ( typeof(exitFunc) !== "function") {
         SilentDCM.END = function(){            
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        }
    }
    else {
        SilentDCM.END=exitFunc             
    }
                            
    if ( DCMchannel.length != 3 && DCMchannel.length != 0) {
        Utilities.print("#ERROR: Channel for silent DCM verification "
                        + "is not specified.\nTest cannot be executed."
        );
        SilentDCM.END(false);
    }
    else if (DCMchannel.length == 0) {
        SilentDCM.DCM_CHANNEL = DCMchannel;
        Utilities.print("INFO: Channel change for silent DCM verification "
                        + "will not executed."
        );
        SilentDCM.DCM_CHANNEL = ""
    }
    else {
        SilentDCM.DCM_CHANNEL = DCMchannel
    }
    
    if ( typeof(timeout) == "undefined"
         || timeout == "" ) {
        SilentDCM.TIMEOUT = 0;
    }
    else {
        SilentDCM.TIMEOUT = timeout;
    }
    
    if ( typeof(listName) == "undefined"
         || listName == "") {
        Utilities.print("WARN: Overall list will be checked.");
        SilentDCM.LIST_NAME = "overall";
    }
    else {
        SilentDCM.LIST_NAME = listName;
    }
    
    if ( typeof(serviceList) == "undefined" || serviceList === "") {
        Utilities.print("WARN: Only service list availability will be checked.");
        SilentDCM.SERVICELIST = "";
    }
    else {
        SilentDCM.SERVICELIST = serviceList;
    }
    
    if ( typeof(exitFunc) == "function") {
        SilentDCM.manager(["SwitchToDCMchannel"])
    }
    else {
        SilentDCM.manager(["Connect"])               
    }
},
/**
 * Execute selected type of DCM update
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof SilentDCM
 * {@link ChannelChange}, {@link Timer}, {@link PressButton},
 * {@link Structures}
 */
manager: function (args) {
    var steps = {
        "Connect": function() {
        //print test description:
        Utilities.print(" ");
        Utilities.print("Test description:");
        Utilities.print("1. Connect PC to TV.");
        Utilities.print("2. Switch to DCM channel.");
        Utilities.print("3. Verify update notification "
                        + "is not displayed.");
        Utilities.print("4. Wait for DCM update.");
        Utilities.print("5. Check DCM result by list comparison.");
        Utilities.print(" ");
        Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                SilentDCM.manager(["SwitchToDCMchannel"]);
            }, 2000);
        },
        // Switch to DCM channel
        "SwitchToDCMchannel": function() {
            if (SilentDCM.DCM_CHANNEL != "") {
                Utilities.print("Switching to DCM channel...");
                ChannelChange.zapWithVerification(
                    function() {
                        Utilities.print(
                            "Switch to DCM channel "
                                + "is successful.");
                        SilentDCM.manager(["CloseUnnecessaryOSDs"]);
                    },
                    SilentDCM.DCM_CHANNEL[0],
                    SilentDCM.DCM_CHANNEL[1],
                    SilentDCM.DCM_CHANNEL[2],
                    function() {
                        Utilities.print(
                            "#VERIFICATION FAILED: "
                                + "Switch to homing channel "
                                + "was not performed");
                        SilentDCM.manager(["EndTest"]);
                    }
                );
            }
            else {
                SilentDCM.manager(["CloseUnnecessaryOSDs"]);
            }    
        },
        // Check availability of DCM notification
        "CloseUnnecessaryOSDs" : function() {
                Messages.closeMessages(
                    function() {
                        Utilities.print("#VERIFICATION FAILED: Interactive DCM "
                                        + "message is displayed.");
                        SilentDCM.manager(["LiveDCM"]);
                    },
                    Message.DCM_LIVE,
                    function() {
                        SilentDCM.manager(["Timeout"]);
                    },
                    function() {
                        SilentDCM.manager(["EndTest"]);
                    }
                );
        },
        // wait for DCM
        "Timeout" : function() {
            Utilities.print("Wait " + (SilentDCM.TIMEOUT/1000) 
                            + " sec for DCM update.");
            window.setTimeout(function(){
                SilentDCM.manager(["CheckList"]);},
                SilentDCM.TIMEOUT)
        },
        // wait for DCM
        "LiveDCM" : function() {
            Messages.confirmMessage(
                function() {
                    Utilities.print("DCM dialog was confirmed "
                                    + "successfully.");
                    SilentDCM.manager(["ClosedDCM"]);
                },
                [ Message.DCM_LIVE, DCMflow.IMMEDIATELY ],
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "DCM dialog was not confirmed.");
                    SilentDCM.manager(["EndTest"]);
                },
                function() {
                    SilentDCM.manager(["EndTest"]);
                }
            );
        },
        // Check service list after DCM
        "ClosedDCM" : function () {
            Utilities.print("Live DCM results will be processed by default.");
            Scan.defaultScan("1", function(){
                SilentDCM.manager(["CheckList"]);
                })
        },
        // Check service list after DCM
        "CheckList" : function () {
            CheckServiceList.startTest(
                   SilentDCM.LIST_NAME,
                   SilentDCM.SERVICELIST,
                   function(result){
                        SilentDCM.manager(["EndTest",result]);
                       }
                )
        },
        // Finalize test
        "EndTest" : function(result) {
            SilentDCM.END(result[0]||false);
        }
    }
    steps[args[0]](args.splice(1, 1));
}

}

}
