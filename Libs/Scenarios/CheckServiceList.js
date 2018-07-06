include('../Utilities.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script for verification servicelist.
* List is selected by name
* @requires Library: {@link Utilities}, {@link ServiceList}
*/
CheckServiceList = {

SERVICELIST_NAME: "OVERALL",
SERVICELIST: undefined,
CURRENTLIST: undefined,
CHECKEDLISTS: undefined,
VAR_N:1,
VARIABILITY: false,
RESULT:false,
END: function() {           
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
},

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckServiceList
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
 * @param {string} [exitFunc = CheckServiceList.manager(["EndTest"]);]
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
                     exitFunc) {

    if (typeof(name) == "undefined" || name == "") {
        Utilities.print("INFO: Overall list will be checked.");
    }
    else {
        CheckServiceList.SERVICELIST_NAME = name;
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
            CheckServiceList.VARIABILITY = true;
        }
        CheckServiceList.CHECKEDLISTS = listOfServices;
    }

    if (typeof(exitFunc) == "function") {
        CheckServiceList.END=exitFunc;
        CheckServiceList.manager(["GetListUID"]);
    }
    else {
        CheckServiceList.manager(["Connect"]);
    }
},

/**
 * Compare all services form servicelist with expected result.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CheckServiceList
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
                    CheckServiceList.manager(["GetListUID"]);
                }
            );
        },
        "GetListUID" : function() {
            if (CheckServiceList.SERVICELIST_NAME == "OVERALL") {
                CheckServiceList.manager(["GetList", ""]);
            }
            else {
                ServiceList.getServicelistUID(
                    function(listUID) {
                        CheckServiceList.manager(["GetList", listUID]);
                    },
                    CheckServiceList.SERVICELIST_NAME
                );
            }
        },
        "GetList" : function(UID) {
            if (Utilities.numberOfElements(UID[0]) == 0) {
                Utilities.print("INFO: servicelist '"
                                + CheckServiceList.SERVICELIST_NAME
                                + "' is not found.");
                CheckServiceList.manager(["EndTest"]);
            }
            else {
                if (Utilities.numberOfElements(UID[0]) == 1) {
                    if (CheckServiceList.CHECKEDLISTS !== undefined
                         && CheckServiceList.CHECKEDLISTS !== "") {
                        ServiceList.getServicesFromList(
                            function(services) {
                                CheckServiceList.CURRENTLIST = services;
                                CheckServiceList.manager(["TakeExpectedResult"]);
                            },
                            UID[0]
                        );
                    }
                    else{
                        Utilities.print("#VERIFICATION PASSED: List '"
                                        + CheckServiceList.SERVICELIST_NAME
                                        + "' is available.");
                        CheckServiceList.manager(["EndTest"])
                    }
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: " 
                                    + Utilities.numberOfElements(UID[0])
                                    + " servicelists '"
                                    + CheckServiceList.SERVICELIST_NAME
                                    + "' are found.");
                    CheckServiceList.manager(["EndTest"])
                }
            }
        },
        "TakeExpectedResult" : function() {
            // check if the pool of checked lists is empty
            var emptyLists = (
                Utilities.numberOfElements(
                    CheckServiceList.CHECKEDLISTS
                ) == 0
            );
            // check if there're several expected servicelists available
            var varLists = CheckServiceList.VARIABILITY;
            // check if the first service list exists and is not empty
            var firstList = (
                !emptyLists && CheckServiceList.CHECKEDLISTS[0].length > 0
            );

            if (!emptyLists && varLists) {
                // several expected results
                CheckServiceList.SERVICELIST = CheckServiceList.CHECKEDLISTS[0]; 
                CheckServiceList.CHECKEDLISTS = CheckServiceList.CHECKEDLISTS.slice(1);
                Utilities.print("Check variant " + CheckServiceList.VAR_N 
                        + " of expected service list.");
                CheckServiceList.VAR_N++;
                CheckServiceList.manager(["CheckList"])                                  
            }
            else if (!varLists && (emptyLists || firstList)) {
                // empty list should be checked
                CheckServiceList.SERVICELIST = CheckServiceList.CHECKEDLISTS;
                CheckServiceList.CHECKEDLISTS = [[]];
                CheckServiceList.manager(["CheckList"])
            }
            else {
                // I foresee copy/paste magic here, but have no proof
                Utilities.print("Service list verification is finished."); 
                if (CheckServiceList.RESULT != true) {
                    Utilities.print("INFO: Service list '"
                                + CheckServiceList.SERVICELIST_NAME
                                + "' does not match expected result.");
                }
                CheckServiceList.manager(["EndTest"])
            }
        },
        "CheckList" : function() {
            Utilities.print("Compare services...");

            var expNumServs = Utilities.numberOfElements(
                CheckServiceList.SERVICELIST
            );
            var exisNumServs = Utilities.numberOfElements(
                CheckServiceList.CURRENTLIST
            );

            if (expNumServs != exisNumServs) {
                Utilities.print("INFO: Number of services in '"
                                + CheckServiceList.SERVICELIST_NAME
                                + "' list is " + exisNumServs
                                + " instead of expected " + expNumServs
                                + ".");
            }
            
            function hash (arrayRow) {
                return [arrayRow[2], arrayRow[3], arrayRow[4]].join("-");
            };

            var resultDict = Compare.makeDictionary(
                                CheckServiceList.SERVICELIST,
                                CheckServiceList.CURRENTLIST,
                                hash
                             );
            var logLabels = ["\tName", "ChNum", "SID",
                                 "TSID", "ONID", "Type",
                                 "Visible", "Selectable"];
                    
            if (Compare.compareDictionaries(resultDict,
                                            logLabels,
                                            "INFO")) {
                Utilities.print("#VERIFICATION PASSED: '"
                                + CheckServiceList.SERVICELIST_NAME
                                + "' is equal to expected.");
                CheckServiceList.RESULT = true;
                CheckServiceList.manager(["EndTest"])
            }
            else {
                CheckServiceList.manager(["TakeExpectedResult"]);
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

            if (CheckServiceList.RESULT != true) {
                Utilities.print("#VERIFICATION FAILED: '"
                                + CheckServiceList.SERVICELIST_NAME
                                + "' is NOT equal to expected.");
                if (CheckServiceList.CURRENTLIST !== undefined) {
                    Utilities.print("");
                    Utilities.print("Actual list:");
                    CheckServiceList.CURRENTLIST.forEach(
                        function(item) {
                            Utilities.print(prettyPrint(item));
                        }
                    )
                }
            }
            CheckServiceList.END(CheckServiceList.RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
