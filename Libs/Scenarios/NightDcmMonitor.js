include('../Utilities.js');
include('../Scan.js');

init = function () {

/** @namespace
* Test script for Initial scan
* @requires Library: {@link Utilities}, {@link Scan}
*/
NightDcmMonitor = {

SCAN_RESULT: {},
NUMBER_OF_TV_SERVICES: "",
NUMBER_OF_RADIO_SERVICES: "",
END: function(){
        Utilities.print("Test finished.");
        Utilities.printTestResult();
        Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof NightDcmMonitor
 *
 * @param {object} [scanResult]
 * Array containing scan states and required actions,
 * for example, LCN conflict and required swap for Mediaset.
 * Script will check that not expected states were not observed
 * during test execution.
 * See template InitialScan(Mediaset).html for more details.
 *
 * @param {string} [exitFunc = function(){
                                    Utilities.print("Test finished.");
                                    Utilities.printTestResult();
                                    Utilities.endTest()
                                }]
 * for exapmle exitFunc = function(){CheckServiceList.manager(["CheckList"]);}
 * Function that should be called at the end of verification.
 * If parameter is not set, test will be finished with result printing.
 * If function is set, test will be started wothout connection to TV
 *
 * @example
 * Structure of settings
 * Structure of scanResult
 * var expectedScanResult = {
 *      lcnConflict: {
 *          serviceList:[],
 *          executeSwap:[]
 *      }
 * };
 * @requires Library: {@link Utilities}
 */
startTest: function (n_TvServices,
                     n_RadioServices,
                     scanResult,
                     exitFunc) {

    NightDcmMonitor.NUMBER_OF_TV_SERVICES = n_TvServices;
    NightDcmMonitor.NUMBER_OF_RADIO_SERVICES = n_RadioServices;

    if (typeof(scanResult) != "undefined"
        && scanResult != ""
        && Object.keys(scanResult).length != 0){
        NightDcmMonitor.SCAN_RESULT = scanResult;
    }

    if ( typeof(exitFunc) == "function") {
        NightDcmMonitor.END = exitFunc;
        NightDcmMonitor.manager(["CloseOSDs"]);
    }
    else {
        NightDcmMonitor.manager(["Connect"]);
    }

},

/**
 * Executor of DCM monitor with test environment setting
 * and scan result verification.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof InitialScan
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            //print test description:
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Close all irrelevant messages.");
            Utilities.print("3. Check if night DCM result is displayed.");
            Utilities.print("RC key pressing will be used if wizard is open");
            Utilities.print("4. Check all scan states if they are expected.");
            Utilities.print("   (LCN conflict, New found, Non found services).");
            Utilities.print("Default services state will be accepted if scan "
                            + "state has an error.");
            Utilities.print("5. DCM wizard is closed if scan state is finished.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){ NightDcmMonitor.manager(
                ["CloseOSDs"]); });
        },
        "CloseOSDs" : function(){
            Utilities.print("Closing irrelevant messages...");
            Messages.closeMessages(
                function(){ NightDcmMonitor.manager(["CheckDCMResult"]); },
                Message.NO_MESSAGE,
                function(){ NightDcmMonitor.manager(["EndTest"]); }
            );
        },
        "CheckDCMResult" : function(){
            Scan.dcmMonitor( function(){
					if (de.loewe.sl2.i32.channel.search.source.getValue() == 11) {
							if (NightDcmMonitor.SCAN_RESULT.hasOwnProperty("unfoundServices"))
							Scan.dvbtUnfoundServicesAnalysis( function(){
									NightDcmMonitor.manager(["EndTest"]); },
									NightDcmMonitor.SCAN_RESULT.unfoundServices);
							else {
							Scan.dvbtUnfoundServicesAnalysis( function(){
									NightDcmMonitor.manager(["EndTest"]); },
									[]);
							}
					}
					else (
						NightDcmMonitor.manager(["EndTest"])
					)},
                NightDcmMonitor.NUMBER_OF_TV_SERVICES,
                NightDcmMonitor.NUMBER_OF_RADIO_SERVICES,
                NightDcmMonitor.SCAN_RESULT)
        },
        "EndTest" : function(result) {
            NightDcmMonitor.END(result[0]||false);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}

}
