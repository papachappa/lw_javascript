include('../Utilities.js');
include('../Dashboard.js');
include('../Compare.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script for dashboard verification 
* @requires Library: {@link Utilities}, {@link ServiceList},
* {@link Compare}
*/
CheckDashboard = {

EXPECTED_RESULT: [],
CURRENT_LIST: undefined,
FIELDS: [1,2,3,5,15,14,4],
FILTERS: {},
RANGE:0,
SB_RANGE:0,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckDashboard
 * 
 * @param {array} [expectedResult]
 * List of all services present on dashboard under test
 * Each service should be described by the same parameter set:
 * Services name, URI, sid, tsid, onid.
 * ATTENTION! PRESUMABLE VERIFICATION OF EMPTY SERVICELIST WILL NOT
 * WORK BECAUSE OF USING Utilities.getTableValues
 *
 * @param {function} [exitFunc=function() {
 *                                 Utilities.print("Test finished.");
 *                                 Utilities.printTestResult();
 *                                 Utilities.endTest();
 *                               }]
 * Function that should be called at the end of the test.
 * If parameter is not set, test will be finished with result printing.
 * 
 *  @param {array} [fields]
 * Fields (service parameters) should be verified.
 * ATTENTION! DIR_Fields.LOCATOR always should be the last
 *
 * @param {object} [filters={}]
 * Dictionary describing selection fields values. Its keys are field
 * numbers in the service list, its values filter on exact match
 * fields encoded by keys.
 *
 * @example
 *
 * Structure of expected result based on the example of fields above
 * var expectedServiceList = [
 *  [ "NL1", "4", "11", "", "8193", "onid=1000&sid=18001&tsid=18", "1" ],
 *  [ "NL2", "4", "11", "", "8193", "onid=1000&sid=18006&tsid=18", "2" ],
 *  [ "NL3", "4", "11", "", "8193", "onid=1000&sid=18003&tsid=18", "3" ],
 *  [ "HD_service", "4", "11", "", "8193", "onid=1000&sid=29&tsid=18", "4" ],
 *  [ "add_service", "4", "11", "", "8193", "onid=1000&sid=22009&tsid=22", "5" ],
 *  [ "Zone ", "4", "11", "file:///mnt/lo_003/image-cache/3949.png", "8193", "onid=1000&sid=22004&tsid=22", "6" ],
 *  [ "TMF", "4", "11", "", "8193", "onid=1000&sid=10&tsid=18", "7" ],
 *  [ "Film1 HD", "4", "11", "", "8193", "onid=1000&sid=22001&tsid=22", "8" ],
 *  [ "Loewe Channel", "32", "63", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=logo&id=854&device=0", "8193", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=open&id=854&device=0", "9" ],
 *  [ "LUMAS", "32", "63", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=logo&id=4733&device=0", "139265", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=open&id=4733&device=0", "10" ],
 *  [ "YouTube", "32", "63", "file:////usr/local/content/dashboard-favorites/thumbnails/youtube.png", "139265", "http://youtube.com/tv", "11" ],
 *  [ "Berliner Philharmoniker", "32", "63", "file:///usr/local/content/dashboard-favorites/thumbnails/berliner_philharmoniker.png", "139265", "http://tv.digitalconcerthall.com/loewe", "12" ],
 *  [ "Uitzending Gemist", "32", "63", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=logo&id=703&device=0", "8193", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=open&id=703&device=0", "13" ],
 *  [ "HBVL", "32", "63", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=logo&id=174&device=0", "8193", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=open&id=174&device=0", "14" ],
 *  [ "Aupeo", "32", "63", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=logo&id=14&device=0", "8193", "http://www.loewe.tv/medianet/sl3xx/dashboard.php?cmd=open&id=14&device=0", "15" ],
 * ];
 * @requires Library: {@link Utilities}
 */
startTest: function (expectedResult,
                     fields,
                     filters,
                     frError,
                     sbError,
                     exitFunc) {
    if ( typeof(exitFunc) == "function") {
        CheckDashboard.END = exitFunc;
    }
    
    if (Array.isArray(expectedResult)) {
        CheckDashboard.EXPECTED_RESULT = expectedResult;
    }
    else {
        Utilities.print(
                "#ERROR: Expected result is not specified correctly.");
        CheckDashboard.END(false)
    }
    
    if (Array.isArray(fields) && fields.length != 0) {
        CheckDashboard.FIELDS = fields;
    }
    else {
        Utilities.print("INFO: Default fields set will be "
                        + "requested:\n"
                        + CheckDashboard.FIELDS.map(
                            function(item) {
                                return Utilities.getKey(DIR_Fields,
                                                        item);
                            }));
    }
    
    if (typeof(filters) == "object"
        && Object.keys(filters).length != 0) {
        CheckDashboard.FILTERS = filters;
    }
    else {
        Utilities.print("INFO: All items will be requested.");
    }
    
    if ( typeof(frError) == "undefined" || frError == "") {
        Utilities.print("INFO: equal frequency value will be checked");
        CheckDashboard.RANGE = 0;
    }
    else {
        CheckDashboard.RANGE = frError;
    }
    
    if ( typeof(sbError) == "undefined" || sbError == "") {
        Utilities.print("INFO: equal symbolrate value will be checked");
        CheckDashboard.SB_RANGE = 0;
    }
    else {
        CheckDashboard.SB_RANGE = sbError;
    }

    if ( typeof(exitFunc) == "function") {
        CheckDashboard.manager(["GetServices"]);
    }
    else {
        CheckDashboard.manager(["Connect"]);
    }
},

/**
 * Compare all services from the bashboard under test with expected
 * result.
 * @author Anna Klmovskaya aklimovskaya@luxoft.com
 * @memberof CheckDashboard
 * @requires Library: {@link Utilities}, {@link Compare}, {@link Dashboard}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get services from dashboard");
            Utilities.print("3. Compare services list with expected "
                            + "result.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                CheckDashboard.manager(["GetServices"]);
            });
        },
        "GetServices" : function() {
            Dashboard.getFilteredServicesFromDashboard(
                function(services){
                    if (services.length > 0) {
                        if (CheckDashboard.EXPECTED_RESULT.length > 0) {
                            CheckDashboard.manager(["CheckResult",services]);
                        }
                        else {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Dashboard is not empty.");
                            CheckDashboard.CURRENT_LIST = services;
                            CheckDashboard.manager(["EndTest"]);
                        }
                    }
                    else {
                        if (CheckDashboard.EXPECTED_RESULT.length == 0) {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Dashboard is empty.");
                            CheckDashboard.manager(["EndTest", true]);
                        }
                        else {
                            Utilities.print("#ERROR: Test will be terminated");
                            CheckDashboard.manager(['EndTest']);
                        }
                    }
                },
                CheckDashboard.FILTERS,
                CheckDashboard.FIELDS);
        },
        "CheckResult" : function(services) {
            CheckDashboard.CURRENT_LIST = services[0];
            var actualDashboard = ServiceList.uriRefactoring(services[0], 6);
            var actualDashboard = Dashboard.refactoring(actualDashboard, 3, 6, 5);
            var expectedDashboard = Dashboard.refactoring(CheckDashboard.EXPECTED_RESULT, 3, 6, 5);
            Utilities.print("Comparing services...");

// Item index on dashboard is used for item identification 
            function makeIndex(line) {
                return line[5];
            }
// Headers for result pretty printing
            var logLabels = ["\tName", "Type", "Subtype",
                                 "URL", "Attributes", "Index", "DVB_triplet", 
                                 "Frontend", "Satid", "Frequency",
                                 "Modulation", "Symbolrate", "Bandwidth",
                                 "Coderate", "Plpid", "Datasliceid", 
                                 "Inversion", "Polarization", "Band", 
                                 "Modcod", "DVBTpriority", "onid","sid",
                                 "tsid"];

            var actualResult = Compare.makeDictionary(
                expectedDashboard,
                actualDashboard,
                makeIndex,
                Number(9),
                CheckDashboard.RANGE,
                Number(11),
                CheckDashboard.SB_RANGE
            );
            CheckDashboard.manager(
                ['EndTest', Compare.compareDictionaries(actualResult,
                                                        logLabels)]);
        },
        "EndTest" : function(result) {
            if (result[0] != true) {
                if (CheckDashboard.CURRENT_LIST !== undefined) {
                    Utilities.print("");
                    Utilities.print("Actual dashboard:");
                    CheckDashboard.CURRENT_LIST.forEach(
                        function(item) {
                            Utilities.print(Utilities.prettyPrint(item));
                        }
                    )
                }
            }
            CheckDashboard.END(result[0]||false);
        }
    }
    steps[args[0]](args.slice(1));
}

}}
