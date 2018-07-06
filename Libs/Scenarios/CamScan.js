include('../Utilities.js');
include('../Messages.js');
include('../PressButton.js');
include('../CAM.js');

init = function () {

/** @namespace
 * Test script for CAM scan
 * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
 * {@link ChannelChange}, {@link Timer}, {@link PressButton},
 * {@link Structures}
 */
CamScan= {

SCAN_FLOW: "",
SCAN_SOURCES: [],
MESSAGES:[],
ERROR:0,
NUMBER_OF_TV_SERVICES: "",
NUMBER_OF_RADIO_SERVICES: "",
RESULT: true,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},
/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CamScan
 *
 * @param {string} [exitFunc]
 * Function that should be called at the end
 * with test result = true/false as parameter
 * If exitFunction is not set, test will be
 * finished with result printing.
 *
 * @requires Library: {@link Utilities}
 */
startTest: function (scanFlow,
                     scanSources,
                     scanProcess,
                     n_TvServices,
                     n_RadioServices,
                     endFunc
                     ) {
    if (typeof(endFunc) == 'function') {
        CamScan.END = endFunc;
    }

    if ( typeof(scanFlow) != "number" ) {
        Utilities.print("#ERROR: CAM scan flow is not specified. "
                        + "\nTest cannot be executed.");
        jbiz.exit()
    }
    else {
        CamScan.SCAN_FLOW = scanFlow;
    }
    
    if ( typeof(scanSources) != "object" ) {
        Utilities.print("#ERROR: Scanned sources is not specified as array"
                        + "\nTest cannot be executed.");
        jbiz.exit()
    }
    else {
        CamScan.SCAN_SOURCES = scanSources;
    }
    
    if ( typeof(scanProcess) != "object" ) {
		CamScan.MESSAGES = [[6, "Tuning complete, please wait..."]]
    }
    else {
		if (scanProcess.hasOwnProperty("messages")) {
			if (scanProcess.messages.length > 0){
				CamScan.MESSAGES = scanProcess.messages;
			}
			else {
				CamScan.MESSAGES = [[6, "Tuning complete, please wait..."]]
			}
		}
		else {
			if (scanProcess.length == 0) {
				CamScan.MESSAGES = [[6, "Tuning complete, please wait..."]]
			}
			else {
				CamScan.MESSAGES = scanProcess
			}
		}
		if (scanProcess.hasOwnProperty("errorType")) {
			CamScan.ERROR = scanProcess.errorType;
		}
    }

    
    if ( typeof(n_TvServices) == "undefined"
         || n_TvServices  === "" ) {
        Utilities.print("WARN: Number of found TV services "
                        + "will NOT be checked.");
        CamScan.NUMBER_OF_TV_SERVICES = "";
    }
    else {
        CamScan.NUMBER_OF_TV_SERVICES = n_TvServices;
    }

    if ( typeof(n_RadioServices) == "undefined"
         || n_RadioServices === "" ) {
        Utilities.print("WARN: Number of found Radio services "
                        + "will NOT be checked.");
        CamScan.NUMBER_OF_RADIO_SERVICES = ""
    }
    else {
        CamScan.NUMBER_OF_RADIO_SERVICES = n_RadioServices;
    }

    if (typeof(endFunction) == 'function') {
        CamScan.manager(["CloseUnnecessaryOSDs"]);
    }
    else {
        CamScan.manager(["Connect"]);
    }
},
/**
* Execute selected type of CAM scan
* @author Anna Klimovskaya aklimovskaya@luxoft.com
* @memberof CamScan
* {@link ChannelChange}, {@link Timer}, {@link PressButton},
* {@link Structures}
*/

manager: function (args) {
    var steps = {
        "Connect" : function() {
            //print test description:
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Verify whether operator profile scan is "
                            + "requested.");
            switch (CamScan.SCAN_FLOW){
            case 9:
                Utilities.print(
                    "3. Select immediate scan and "
                        + "confirm the notification respectively.");
                Utilities.print(
                    "4. Verify whether the notification "
                        + "is closed");
                Utilities.print(
                    "5. Monitor process of a CI scan.");
                Utilities.print(
                    "6. All CI scan messages are closed");
                break;
            case 10:
                Utilities.print(
                    "3. Select scan before standby and "
                        + "confirm the notification respectively.");
                Utilities.print( "4. CASE IS NOT IMPLEMENTED");
                break;
            case 11:
                Utilities.print(
                    "3. Select postponed scan and "
                        + "confirm the notification respectively.");
                Utilities.print( "4. CASE IS NOT IMPLEMENTED");
                break;
            }
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                    CamScan.manager(["CloseUnnecessaryOSDs"]);
                }, 2000);
            },
        // Check availability of CAM scan notification
        "CloseUnnecessaryOSDs" : function() {
            Messages.closeMessages(
                function() {
                    Utilities.print(
                            "CI scan message is displayed. "
                            + "All unnecessary messages are closed.");
                    CamScan.manager(["ConfirmUpdateMsg"]);
                },
                Message.CA_AUTOSEARCH,
                function() {
                    Utilities.print(
                        "#VERIFICATION FAILED: "
                            + "Expected CI scan dialog is not "
                            + "available.");
                    CamScan.RESULT = false;
                    CamScan.manager(["EndTest"]);
                },
                function() {
                    CamScan.RESULT = false;
                    CamScan.manager(["EndTest"]);
                }
            );
        },
        // Select update flow in notification
        "ConfirmUpdateMsg" : function() {
            Messages.confirmMessage(
                function() {
                    Utilities.print("CI scan dialog was confirmed "
                                    + "successfully.");
                    CamScan.manager([
                        "CheckClosedDCMdialog"
                        ]);
                },
                [ Message.CA_AUTOSEARCH, CamScan.SCAN_FLOW ],
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "CI scan dialog was not confirmed.");
                    CamScan.RESULT = false;
                    CamScan.manager(["EndTest"]);
                },
                function() {
                    CamScan.RESULT = false;
                    CamScan.manager(["EndTest"]);
                }
            );
        },
        // Check that notification is closed
        "CheckClosedDCMdialog" : function() {
            var flows = {
                "9": function() {
                    Utilities.print("Immediate update is selected.")
                    CamScan.manager(["ScanMonitor"]);
                },
                "10": function() {
                    Utilities.print("CI scan is postponed to standby.")
                    Utilities.print("#VERIFICATION  OF NEXT STEPS "
                                    + "CURUNTLY IS NOT IMPLEMENTED ")
                    CamScan.manager(["EndTest"]);
                },
                "11": function() {
                    Utilities.print("#VERIFICATION PASSED:"
                                    + " Update is postponed to next "
                                    +"request.")
                    CamScan.manager(["EndTest"]);
                }
            };
            var flowSetup = flows[CamScan.SCAN_FLOW];
            Messages.closeMessages(
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "CAM scan dialog is still active.");
                    CamScan.RESULT = false;
                    CamScan.manager(["EndTest"]);
                },
                Message.CA_AUTOSEARCH,
                flowSetup,
                function() {
                    CamScan.RESULT = false;
                    CamScan.manager(["EndTest"]);
                }
            );
        },
        // --------- Immediate scan ------------
        // Monitor scan process
        "ScanMonitor" : function() {
            CAM.camScanHandler(
                function(result){
                    function check (){
                        CamScan.manager(["CheckTV"])
                    }
                    window.setTimeout(check, 2000)},
                CamScan.SCAN_SOURCES,
                CamScan.MESSAGES,
                function(){CamScan.RESULT = false;
                    function check (){
                        CamScan.manager(["CheckTV"])
                    }
                    window.setTimeout(check, 2000)
                }
            )
        },
        // Check TV state at the end of scan
        "CheckTV" : function() {
            var scanState = de.loewe.sl2.tvapi.i32.channel.search.search.state.getValue();
            var tv = de.loewe.sl2.i32.channel.search.found.services.getValue();
			var radio = de.loewe.sl2.i32.channel.search.found.radio.services.getValue();		
				if (scanState == 10){
					if ((CamScan.NUMBER_OF_TV_SERVICES + CamScan.NUMBER_OF_RADIO_SERVICES) > 0) {
						Utilities.print("#VERIFICATION PASSED: Window with "
									+ "number of found services is displayed.");
						if (CamScan.NUMBER_OF_TV_SERVICES !== "") {
							if (tv == CamScan.NUMBER_OF_TV_SERVICES){
							Utilities.print("#VERIFICATION PASSED: Number of "
									+ "found TV services is " + tv)
								}
							else {
								Utilities.print("#VERIFICATION FAILED: Number of "
									+ "found TV services is " + tv 
									+ " that is different from expected " 
									+ CamScan.NUMBER_OF_TV_SERVICES + ".")
								CamScan.RESULT = false;
							}
						}
						if (CamScan.NUMBER_OF_RADIO_SERVICES !== "") {
							if (radio == CamScan.NUMBER_OF_RADIO_SERVICES){
								Utilities.print("#VERIFICATION PASSED: Number of "
									+ "found Radio services is " + radio + ".")
								}
							else {
								Utilities.print("#VERIFICATION FAILED: Number of "
									+ "found Radio services is " + radio 
									+ " that is different from expected " 
									+ CamScan.NUMBER_OF_RADIO_SERVICES + ".")
								CamScan.RESULT = false;
							}
						}
					}
					else {
						Utilities.print("#INFO: Window with "
									+ "number of found services is displayed.");
						Utilities.print("#INFO: Number of "
									+ "found TV services is " + tv + ".");
						Utilities.print("#INFO: Number of "
									+ "found Radio services is " + radio + ".");
					}
				}
				else if (scanState == 0) {
					if ((CamScan.NUMBER_OF_TV_SERVICES + CamScan.NUMBER_OF_RADIO_SERVICES) > 0){
						Utilities.print("#VERIFICATION FAILED: Window with "
								+ "number of found services is NOT displayed.");
					}
					else {
						Utilities.print("#INFO: Window with "
								+ "number of found services is NOT displayed.");
					}
				}
				else if (scanState == 11) {
						if ((CamScan.NUMBER_OF_TV_SERVICES + CamScan.NUMBER_OF_RADIO_SERVICES) > 0){
							Utilities.print("#VERIFICATION FAILED: Scan Error is displayed");
						}
						else {
							Utilities.print("#INFO: Scan Error is displayed");
							var currentError = de.loewe.sl2.tvapi.i32.channel.search.search.error.getValue();
							var expectedErrorType = Utilities.getKey(ScanError, CamScan.ERROR);
							if (currentError == CamScan.ERROR){

								Utilities.print("#VERIFICATION PASSED: Scan error " + expectedErrorType 
									+ " is displayed.")
							}
							else {
								Utilities.print("#VERIFICATION FAILED: Scan error with ID (" 
									+ currentError + ") is displayed, but expected " + expectedErrorType 
									+ " (id is " + CamScan.ERROR + ").");
							}
							CamScan.ERROR = 0;
						}
					}
				else{
					Utilities.print("#VERIFICATION FAILED: Current state: "
                            + Utilities.getKey(SearchState, scanState));
				};
			CamScan.manager(["PrepareEndCheck"])
				
        },
        "PrepareEndCheck" : function() {
            Messages.closeMessages(
                function() {
                    CamScan.manager(["EndCheck"]);
                },
                Message.NO_MESSAGE
            );
        },
        "EndCheck" : function() {
            Utilities.print("Finish scan.");
            PressButton.singlePress(21);
            window.setTimeout(function(){
                var scanState = de.loewe.sl2.tvapi.i32.channel.search.search.state.getValue();
                var camScanState = de.loewe.sl2.tvapi.i32.channel.search.cam.scan.state.getValue();
                if (scanState == 0 || scanState == 12) {
                    Utilities.print("#VERIFICATION PASSED: CAM scan wizard is closed");
					if (camScanState == 0 || camScanState == 2) {
					    Utilities.print("#VERIFICATION PASSED: No CAM scan is requested");
					}
					else {
					    var states ={ 1:"wait", 2: "ready", 3: "finished"}
						Utilities.print("#VERIFICATION FAILED: CI scan is in '"
										+ states[camScanState] + "' state.");
						Utilities.print("INFO: The following logic is implemented for the CAM scan state"
							+ ", which has a misleading name:")
						Utilities.print("- It is reset to WAITING once the initial installation is started.")
						Utilities.print("- It is set to READY if at least one CAM requested an operator" 
							+ "profile scan, and it is known from all the CAMs whether or not they support"
							+ " an operator profile scan or a timeout has elapsed.")
						Utilities.print("- It is set to FINISHED if none of the CAMs requested an operator"
							+ "profile scan, and it is known from all the CAMs whether or not they support"
							+ " an operator profile scan or a timeout has elapsed.")
						Utilities.print("The value is of no significance after the initial installation"
							+ "wizard has stepped over the point where it displays the screen that it is"
							+ " waiting for the CAM.");
					}
					if (CamScan.ERROR != 0) {
						Utilities.print("#VERIFICATION FAILED: Scan Error is not displayed.");
					}
                    CamScan.manager(["EndTest"])
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: CAM scan wizard is NOT closed");
					Utilities.print("#VERIFICATION FAILED: Current state: "
                            + Utilities.getKey(SearchState, scanState));
                    Utilities.print("INFO: One more attempt to finish scan");  
                    CamScan.RESULT = false;
                    CamScan.manager(["PrepareEndCheck"])
                }
                
            },2000)
        },
        // Finalize test
        "EndTest" : function() {
            CamScan.END(CamScan.RESULT);
        }
    }
steps[args[0]](args.splice(1, 1));
}

}

}
