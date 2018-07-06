include('../Utilities.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script for verification servicelist.
* List is selected by name
* @requires Library: {@link Utilities}, {@link ServiceList}
*/
CheckServiceListWithURI = {

SERVICELIST_NAME: "OVERALL",
SERVICELIST: undefined,
CURRENTLIST: undefined,
CHECKEDLISTS: undefined,
VAR_N:1,
VARIABILITY: false,
RESULT:false,
RANGE:0,
SYMBOL_RANGE:0,
END: function() {           
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
},

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckServiceListWithURI
 *
 * @param {string} [name = ""]
 * Full list name that should be checked during test.
 * Fail will be returned if mentioned list does not exist.
 * If name is "", then overall list will be checked.
 *
 * @param {array} [listOfServices]
 * Full list of services that should be found on TV during test execution.
 * Each service should described in format:
 * [Name, ChNum, ServiceID, StreamID, NetID, Type, Visibility, Selectability]
 * ATTENTION! PRESUMABLE VERIFICATION OF EMPTY SERVICELIST WILL NOT WORK
 * BECAUSE OF USING Utilities.getTableValues
 * 
 * @param {string} [exitFunc = CheckServiceListWithURI.manager(["EndTest"]);]
 * Function that should be called at the end.
 * If parameter is not set, test will be finished with result printing. 
 * @example
 * // Structure of expected result for services list comparison
 * var expectedServiceList = [
 *     [ 'Name1', '1', '101', '900', '272', '4', '1', '1' ],
 *     [ 'Name2', '2', '102', '900', '272', '4', '1', '1' ],
 *     [ 'Name3', '1', '103', '900', '272', '8', '1', '1' ]
 * ];
 * // Structure of expected result for services list comparison with 
 * several expected results
 *  var expectedServiceList = [
 *     [
 *          [ 'NewName1', '1', '101', '900', '272', '4', '1', '1' ],
 *          [ 'NewName2', '2', '102', '900', '272', '4', '1', '1' ],
 *          [ 'NewName3', '1', '103', '900', '272', '8', '1', '1' ]
 *      ],
 *     [
 *          [ 'Name1', '1', '101', '900', '272', '4', '1', '1' ],
 *          [ 'Name2', '2', '102', '900', '272', '4', '1', '1' ],
 *          [ 'Name3', '1', '103', '900', '272', '8', '1', '1' ]
 *     ]
 * ];
 * // exit function to call next step from main manager 
 * if test should not be stoped
 * function() {manager(["test"]);}
 * @requires Library: {@link Utilities}
 */
startTest: function (name,
                     listOfServices,
                     frError,
                     sbError,
                     exitFunc) {

    if (typeof(name) == "undefined" || name == "") {
        Utilities.print("INFO: Overall list will be checked.");
    }
    else {
        CheckServiceListWithURI.SERVICELIST_NAME = name;
    }

    if (typeof(listOfServices) == "undefined" || listOfServices === "") {
        Utilities.print("INFO: Only service list availability "
                        + "will be checked.");
    }
    else {
        if (listOfServices.length == 0) {
            Utilities.print("INFO: Empty services list is expected");
        }
        // first expected services list can be empty list,
        // that is why several elements are checked
        else if (listOfServices.some(
            function(servicelist) {
                return (typeof(servicelist[0]) == "object");
            }
        )) {
            Utilities.print("INFO: Service list will be compared "
                            + "with several expected results");
            CheckServiceListWithURI.VARIABILITY = true;
        }
        CheckServiceListWithURI.CHECKEDLISTS = listOfServices;
    }
    
    if ( typeof(frError) == "undefined" || frError == "") {
        Utilities.print("INFO: equal frequency value will be checked");
        CheckServiceListWithURI.RANGE = 0;
    }
    else {
        CheckServiceListWithURI.RANGE = frError;
    }
    
    if ( typeof(sbError) == "undefined" || sbError == "") {
        Utilities.print("INFO: equal symbolrate value will be checked");
        CheckServiceListWithURI.SYMBOL_RANGE = 0;
    }
    else {
        CheckServiceListWithURI.SYMBOL_RANGE = sbError;
    }
    

    if (typeof(exitFunc) == "function") {
        CheckServiceListWithURI.END=exitFunc;
        CheckServiceListWithURI.manager(["GetListUID"]);
    }
    else {
        CheckServiceListWithURI.manager(["Connect"]);
    }

},

/**
 * Compare all services form servicelist with expected result.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckServiceListWithURI
 * @requires Library: {@link Utilities}, {@link ServiceList}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get service list UID by list name.");
            Utilities.print("3. Get services from list.");
            Utilities.print("4. Compare service list with expected result.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(
                function() {
                    CheckServiceListWithURI.manager(["GetListUID"]);
                }
            );
        },
        "GetListUID" : function() {
            if (CheckServiceListWithURI.SERVICELIST_NAME == "OVERALL") {
                CheckServiceListWithURI.manager(["GetList", ""]);
            }
            else {
                ServiceList.getServicelistUID(
                    function(listUID) {
                        CheckServiceListWithURI.manager(["GetList", listUID]);
                    },
                    CheckServiceListWithURI.SERVICELIST_NAME
                );
            }
        },
        "GetList" : function(UID) {
            if (Utilities.numberOfElements(UID[0]) == 0) {
                Utilities.print("INFO: servicelist '"
                                + CheckServiceListWithURI.SERVICELIST_NAME
                                + "' is not found.");
                CheckServiceListWithURI.manager(["EndTest"]);
            }
            else {
                if (Utilities.numberOfElements(UID[0]) == 1) {
                    if (CheckServiceListWithURI.CHECKEDLISTS !== undefined
                         && CheckServiceListWithURI.CHECKEDLISTS !== "") {
                        ServiceList.getServicesFromList(
                            function(services) {
                                CheckServiceListWithURI.CURRENTLIST = 
                                    ServiceList.uriRefactoring(services,
                                                               8);
                                CheckServiceListWithURI.manager(["TakeExpectedResult"]);
                            },
                            UID[0],
                            [0,6,8,9,10,21,24,25,2]
                        );
                    }
                    else{
                        Utilities.print("#VERIFICATION PASSED: List '"
                                        + CheckServiceListWithURI.SERVICELIST_NAME
                                        + "' is available.");
                        CheckServiceListWithURI.manager(["EndTest"])
                    }
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: " 
                                    + Utilities.numberOfElements(UID[0])
                                    + " servicelists '"
                                    + CheckServiceListWithURI.SERVICELIST_NAME
                                    + "' are found.");
                    CheckServiceListWithURI.manager(["EndTest"])
                }
            }
        },
        "TakeExpectedResult" : function() {
            // check if the pool of checked lists is empty
            var emptyLists = (
                Utilities.numberOfElements(
                    CheckServiceListWithURI.CHECKEDLISTS
                ) == 0
            );
            // check if there're several expected servicelists available
            var varLists = CheckServiceListWithURI.VARIABILITY;
            // check if the first service list exists and is not empty
            var firstList = (
                !emptyLists && CheckServiceListWithURI.CHECKEDLISTS[0].length > 0
            );

            if (!emptyLists && varLists) {
                // several expected results
                CheckServiceListWithURI.SERVICELIST = CheckServiceListWithURI.CHECKEDLISTS[0]; 
                CheckServiceListWithURI.CHECKEDLISTS = CheckServiceListWithURI.CHECKEDLISTS.slice(1);
                Utilities.print("Check variant " + CheckServiceListWithURI.VAR_N 
                        + " of expected service list.");
                CheckServiceListWithURI.VAR_N++;
                CheckServiceListWithURI.manager(["CheckList"])                                  
            }
            else if (!varLists && (emptyLists || firstList)) {
                // empty list should be checked
                CheckServiceListWithURI.SERVICELIST = CheckServiceListWithURI.CHECKEDLISTS;
                CheckServiceListWithURI.CHECKEDLISTS = [[]];
                CheckServiceListWithURI.manager(["CheckList"])
            }
            else {
                // I foresee copy/paste magic here, but have no proof
                Utilities.print("Service list verification is finished."); 
                if (CheckServiceListWithURI.RESULT != true) {
                    Utilities.print("INFO: Service list '"
                                + CheckServiceListWithURI.SERVICELIST_NAME
                                + "' does not match expected result.");
                }
                CheckServiceListWithURI.manager(["EndTest"])
            }
        },
        "CheckList" : function() {
            Utilities.print("Compare services...");

            var expNumServs = Utilities.numberOfElements(
                CheckServiceListWithURI.SERVICELIST
            );
            var exisNumServs = Utilities.numberOfElements(
                CheckServiceListWithURI.CURRENTLIST
            );

            if (expNumServs != exisNumServs) {
                Utilities.print("INFO: Number of services in '"
                                + CheckServiceListWithURI.SERVICELIST_NAME
                                + "' list is " + exisNumServs
                                + " instead of expected " + expNumServs
                                + ".");
            }
            
            function hash (arrayRow) {
                return [arrayRow[1], arrayRow[5]].join("-");
            };
            
            CheckServiceListWithURI.CURRENTLIST.forEach(
                function(item) {
                    item[8]="DNC";
                }
            );
            
            var resultDict = Compare.makeDictionary(
                                CheckServiceListWithURI.SERVICELIST,
                                CheckServiceListWithURI.CURRENTLIST,
                                hash,
                                Number(11),
                                CheckServiceListWithURI.RANGE,
                                Number(13),
                                CheckServiceListWithURI.SYMBOL_RANGE
                             );
            var logLabels = ["\tName", "ChNum", "SID",
                                 "TSID", "ONID", "Type",
                                 "Visible", "Selectable", "URI", "Frontend",
                                 "Satid", "Frequency", "Modulation", "Symbolrate", 
                                 "Bandwidth", "Coderate", "plpid", "datasliceid",
                                 "Inversion", "Polarization", "Band", "Modcod",
                                 "dvbtpriority", "onid","sid","tsid"];
                    
            if (Compare.compareDictionaries(resultDict,
                                            logLabels,
                                            "INFO")) {
                Utilities.print("#VERIFICATION PASSED: '"
                                + CheckServiceListWithURI.SERVICELIST_NAME
                                + "' is equal to expected.");
                CheckServiceListWithURI.RESULT = true;
                CheckServiceListWithURI.manager(["EndTest"])
            }
            else {
                CheckServiceListWithURI.manager(["TakeExpectedResult"]);
            }
        },
        "EndTest" : function() {
            function prettyPrint(arr) {
                return arr.reduce(
                    function(accum, item) {
                        return accum + '"' + item + '", '
                    },
                    "[ "
                ).slice(0, -2) + " ],";
            }

            if (CheckServiceListWithURI.RESULT != true) {
                Utilities.print("#VERIFICATION FAILED: '"
                                + CheckServiceListWithURI.SERVICELIST_NAME
                                + "' is NOT equal to expected.");
                if (CheckServiceListWithURI.CURRENTLIST !== undefined) {
                    Utilities.print("");
                    Utilities.print("Actual list:");
                    CheckServiceListWithURI.CURRENTLIST.forEach(
                        function(item) {
                            Utilities.print(prettyPrint(item));
                        }
                    )
                }
            }
            CheckServiceListWithURI.END(CheckServiceListWithURI.RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
