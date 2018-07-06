include('../Utilities.js');
include('../Scan.js');
include('../ChannelChange.js');
include('../Messages.js');
include('../CAM_Emulator.js');
include('CheckServiceList.js');
include('ScanCamEmulator.js');

init = function () {

/** @namespace
 * Test script for verification process of silent CAM DCM
 * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
 * {@link ChannelChange}, {@link CheckServiceList}
 */
SilentCamDCM = {

DCM_CHANNEL: [],
LIST_NAME: "#3052",
SERVICELIST: [],
INITIAL_TIMEOUT: 2000,
TIMEOUT: 0,
PROFILE_UPDATE : 0,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},
/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof SilentCamDCM
 *
 *
 * @param {number} [testParameters.initialTimeout = 2000]
 * Timeout after initial profile update and before channel change
 *
 * @param {array} [testParameters.DCMchannel = []]
 * Channel where DCM result should be checked
 * <br/> [channel number, media type, name of service list]
 * Channel change won't be executed  if array doen't have 3 values
 *
 * @param {number} [testParameters.profileUpdate = 0]
 * If profile update should be initilazed
 * 0 -NO profile update, 1 - profile update should be stimulated
 *
 * @param {number} [testParameters.waitForDCM = 0]
 * Timeout after profile update is initilazed
 *
 * @param {string} [testParameters.listName = '#3052']
 * Name of service list that should be checked for verification DCM result.
 * Overall list will be checked if name is not set
 *
 * @param {array} [testParameters.serviceList = '']
 * Name of service list that should be checked for verification DCM result
 * Each service should described in format:
 * <br/> [Name, ChNum, ServiceID, StreamID, NetID, Type, Visibility, Selectability]
 *
 * @param {function} [testParameters.exitFunc = function(){
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set SilentCamDCM.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished
 * with result printing after verification of list creation will be executed.
 *
 * @requires Library: {@link Utilities}
 */
startTest: function (testParameters, exitFunc) {

    if (!testParameters.hasOwnProperty("exitFunc")){
        if (typeof(testParameters.exitFunc) !== "function") {
            SilentCamDCM.END = function(){
                Utilities.print("Test finished.");
                Utilities.printTestResult();
                Utilities.endTest()
            }
        }
        else {
            SilentCamDCM.END=testParameters.exitFunc
        }
    }

    if (testParameters.hasOwnProperty("intialTimeout")){
        if ( testParameters.intialTimeout != "" ) {
            SilentCamDCM.TIMEOUT = Number(testParameters.intialTimeout);
        }
    }

    if (testParameters.hasOwnProperty("profileUpdate")){
        SilentCamDCM.PROFILE_UPDATE = testParameters.profileUpdate;
    }
    else {
        Utilities.print("WARN: Profile update won't be stimulated.")
    }

    if (testParameters.hasOwnProperty("DCMchannel")){
        if (testParameters.DCMchannel.length == 3) {
            SilentCamDCM.DCM_CHANNEL = testParameters.DCMchannel
        }
        else {
            Utilities.print("WARN: Channel change for live DCM verification "
                            + "will not be executed.")
        }
    }

    if (testParameters.hasOwnProperty("waitForDCM")){
        if ( testParameters.waitForDCM != "" ) {
            SilentCamDCM.TIMEOUT = Number(testParameters.waitForDCM);
        }
    }

    if (testParameters.hasOwnProperty("listName")){
        if ( testParameters.listName != "") {
            SilentCamDCM.LIST_NAME = testParameters.listName;
        }
        else {
            Utilities.print("WARN: Overall list will be checked.");
        }
    }

    if (testParameters.hasOwnProperty("serviceList")){
        if ( testParameters.serviceList === "") {
            Utilities.print("WARN: Only service list availability will be checked.");
            SilentCamDCM.SERVICELIST = "";
        }
        else {
            SilentCamDCM.SERVICELIST = testParameters.serviceList;
        }
    }

    if (typeof(exitFunc) == "function") {
        SilentCamDCM.manager(["InitiateProfileUpdate"])
    }
    else {
        SilentCamDCM.manager(["Connect"])
    }

},
/**
 * Execute selected type of DCM update
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof SilentCamDCM
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
            Utilities.print("2. Wait for initial timeout to upload initial profile.");
            Utilities.print("3. Initiate profile update.");
            Utilities.print("4. Switch to DCM channel.");
            Utilities.print("5. Wait for DCM update.");
            Utilities.print("6. Verify update notification "
                            + "is not displayed.");
            Utilities.print("7. Check DCM result by list comparison.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(
                window.setTimeout(function(){
                    SilentCamDCM.manager(["InitiateProfileUpdate"]);},
                SilentCamDCM.INITIAL_TIMEOUT))
        },
        // Initiate profile update
        "InitiateProfileUpdate": function() {
            if (SilentCamDCM.PROFILE_UPDATE != "" &&
                SilentCamDCM.PROFILE_UPDATE != 0 &&
                SilentCamDCM.PROFILE_UPDATE != 'DNC') {
                var camInfo = de.loewe.sl2.common.intf.cam.list;
                var queryForList  =  {
                        selections:   [],
                        // Get name and UUID
                        fields:       [0, 1],
                        orders:       []
                    };

                function callApi(result) {
                    triggerNextStep.onResult.connect(this, onResult);
                    triggerNextStep.onError.connect(this, onError);
                    triggerNextStep.call([result[0][0], result[0][1]]);
                    timerID = window.setTimeout(onResult, 3000);
                }

                Utilities.getTableValues(callApi, camInfo, queryForList)
                var triggerNextStep = de.loewe.sl2.common.intf.action.open;

                function onResult(entry){
                    triggerNextStep.onResult.disconnect(this, onResult);
                    triggerNextStep.onError.disconnect(this, onError);
                    window.clearTimeout(timerID);
                    if (entry == 1) {
                        Utilities.print("Next step in profile testcase is triggered.");
                        SilentCamDCM.manager(["SwitchToDCMchannel"]);
                    }
                    else{
                        Utilities.print("!!Debug print " + entry)
                        Utilities.print("WARN: call of de.loewe.sl2.common."
                                +"intf.action.open doesn't returne success")
                    SilentCamDCM.manager(["SwitchToDCMchannel"]);
                    };
                }

                function onError(){
                    triggerNextStep.onResult.disconnect(this, onResult);
                    triggerNextStep.onError.disconnect(this, onError);
                    window.clearTimeout(timerID);
                    Utilities.print("#ERROR: Next step is not triggered");
                    SilentCamDCM.manager(["SwitchToDCMchannel"]);
                }
            }
            else {
                Utilities.print("Trigger next step in profile testcase "
                                                    + "is not required...");
                SilentCamDCM.manager(["SwitchToDCMchannel"]);
            }
        },
        // Switch to DCM channel
        "SwitchToDCMchannel": function() {
            if (SilentCamDCM.DCM_CHANNEL != "") {
                Utilities.print("Switching to DCM channel...");
                ChannelChange.zapWithVerification(
                    function() {
                        Utilities.print( "Switch to DCM channel is successful.");
                        SilentCamDCM.manager(["CloseUnnecessaryOSDs"]);
                    },
                    SilentCamDCM.DCM_CHANNEL[0],
                    SilentCamDCM.DCM_CHANNEL[1],
                    SilentCamDCM.DCM_CHANNEL[2],
                    function() {
                        Utilities.print(
                            "#VERIFICATION FAILED: Switch to homing channel "
                                + "was not performed");
                        SilentCamDCM.manager(["EndTest"]);
                    }
                );
            }
            else {
                SilentCamDCM.manager(["Timeout"]);
            }
        },
        // wait for DCM
        "Timeout" : function() {
            Utilities.print("Wait " + (SilentCamDCM.TIMEOUT/1000)
                            + " sec for DCM update.");
            window.setTimeout(function(){
                SilentCamDCM.manager(["CloseUnnecessaryOSDs"]);},
                SilentCamDCM.TIMEOUT)
        },
        // Check availability of DCM notification
        "CloseUnnecessaryOSDs" : function() {
                Messages.closeMessages(
                    function() {
                        Utilities.print("#VERIFICATION FAILED: CAM scan "
                                        + "request is displayed.");
                        SilentCamDCM.manager(["ClosedDCM"]);
                    },
                    Message.CA_AUTOSEARCH,
                    function() {
                        SilentCamDCM.manager(["CheckList"]);
                    },
                    function() {
                        SilentCamDCM.manager(["EndTest"]);
                    }
                );
        },
        // Check service list after DCM
        "ClosedDCM" : function () {
            Utilities.print("CAM scan will be processed by default.");
            ScanCam.startTest( 9,
                              [],
                              [],
                              [],
                              {},
                              '',
                              '',
                              function(){SilentCamDCM.manager(["CheckList"])});
        },
        // Check service list after DCM
        "CheckList" : function () {
            CheckServiceList.startTest(
                   SilentCamDCM.LIST_NAME,
                   SilentCamDCM.SERVICELIST,
                   function(result){
                        SilentCamDCM.manager(["EndTest",result]);
                       }
                )
        },
        // Finalize test
        "EndTest" : function(result) {
            SilentCamDCM.END(result[0]||false);
        }
    }
    steps[args[0]](args.splice(1, 1));
}

}

}
