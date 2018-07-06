include('../Utilities.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script to create new favorite list of services.
* @requires Library: {@link Utilities}, {@link ServiceList}
*/
UpdateServiceList = {

SERVICE_LIST: "",
LIST_UID: "",
FIRST_SERVICE: 0,
LAST_SERVICE: 0,
MOVE_POSITION: 0,
FIRST_SERVICE_UID: "",
MEDIA_TYPE: 4,
END: function(){            
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof UpdateServiceList
 * 
 * @param {number} firstNumber
 * The channel number of the service marking the beggining of 
 * the moving block.
 * 
 * @param {number} lastNumber
 * The channel number of the service marking the end of 
 * the moving block.
 * 
 * @param {number} moveTo
 * The channel number of the service where the block will be moved.
 * If parameter is "" or undefined - services from defined 
 * block will be deleted from list.
 * 
 * @param {string} serviceList
 * Service list name that should be updated.
 * 
 * @param {1|2|4|8} mediaType
 * Media type of services that new list should contain
 * 4 - TV, 8 - Radio
 * see {@link Mediatype} for available values; 
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set UpdateServiceList.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (firstNumber,
                     lastNumber,
                     moveTo,
                     serviceList,
                     mediaType,
                     exitFunc) {
                          
    if ( typeof(firstNumber) != "number" ) {
        Utilities.print("#ERROR: The channel number of the service marking "
            + "the beggining of the moving block is not defined correctly.");
        Utilities.print("Test is terminated.");
       setTimeout(function(){jbiz.exit()},300)
    }
    else {
        UpdateServiceList.FIRST_SERVICE = firstNumber
    }  
    
    if ( typeof(lastNumber) != "number" ) {
        Utilities.print("#ERROR: The channel number of the service marking "
            + "the end of the moving block is not defined correctly.");
        Utilities.print("Test is terminated.");
        setTimeout(function(){jbiz.exit()},300)
    }
    else {
        UpdateServiceList.LAST_SERVICE = lastNumber
    } 
    
    if ( typeof(moveTo) != "number" ) {
        Utilities.print("INFO: Services will be removed from list as far "
            + "as the moving position is not defined");
        UpdateServiceList.MOVE_POSITION = ""
    }
    else {
        UpdateServiceList.MOVE_POSITION = moveTo
    }

    if ( typeof(serviceList) == "undefined"
         || serviceList === "") {
        Utilities.print("#ERROR: The services list in not defined correctly.");
        Utilities.print("Test is terminated.");
        setTimeout(function(){jbiz.exit()},300)
    }
    else {
        UpdateServiceList.SERVICE_LIST = serviceList
    }
    
    if ( mediaType != 4 && mediaType != 8) {
        Utilities.print("#ERROR: mediaType is not defined correctly.");
        Utilities.print("Test is terminated.");
        setTimeout(function(){jbiz.exit()},300)
    }
    else {
        //index 1 and 4 are used for list creation instead of 4 and 8                       
        if (mediaType == 4) {
            var mediaType = 1
        }
        if (mediaType == 8) {
            var mediaType = 2
        }
        UpdateServiceList.MEDIA_TYPE = mediaType;  
    }
   
    if ( typeof(exitFunc) != "undefined" && exitFunc != "") {
        UpdateServiceList.END=exitFunc;
        UpdateServiceList.manager(["GetListUID"])
    }
    else {
        UpdateServiceList.manager(["Connect"])
    }

},

/**
 * Service list update .
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof UpdateServiceList
 * @requires Library: {@link Utilities}, {@link ServiceList}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get list UUID.");
            Utilities.print("3. Remember initial service information to "
                                + "check list update.");
            Utilities.print("4. Update service list.");
            Utilities.print("5. Verify list update.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                UpdateServiceList.manager(["GetListUID"]);
            });
        },
        "GetListUID" : function() {
            ServiceList.getServicelistUID(
                function(serviceListUID){
                    UpdateServiceList.manager(["GetServiceInfo",
                                                serviceListUID]);
                }, UpdateServiceList.SERVICE_LIST);
        },
        "GetServiceInfo" : function(listUID) {
            if (Utilities.numberOfElements(listUID[0]) != 1) {
                Utilities.print(Utilities.numberOfElements(listUID[0])
                                + " service lists with name containing '" 
                                + UpdateServiceList.SERVICE_LIST 
                                + "' are found.");
                Utilities.print("#ERROR: Test will be terminated as "
                        + "far as not clear which service list should "
                        + "be updated.") 
                UpdateServiceList.manager(["EndTest", false]);
            }
            else {
                UpdateServiceList.LIST_UID = listUID.toString();
                Utilities.print("Remember UID of the first service in moving "
                                + "block to check list update");
                Utilities.print(UpdateServiceList.LIST_UID);
                var api = de.loewe.sl2.table.servicelist.list;
                var servicesQuery = {
                    selections:[{field:1, conditionType:1,
                                    condition: UpdateServiceList.LIST_UID},
                                {field:6, conditionType:1, 
                                    condition: UpdateServiceList.FIRST_SERVICE},
                                {field:21, conditionType:1, 
                                    condition: UpdateServiceList.MEDIA_TYPE}],
                    fields:[7]
                };
                Utilities.getTableValues(
                    function(serviceUID){
                        UpdateServiceList.manager(["RememberService", serviceUID]);
                    }, api, servicesQuery);
            }
        },
        "RememberService" : function(serviceUID) {
            if (Utilities.numberOfElements(serviceUID[0]) == 0) {
                Utilities.print("Initial service is not found.");
                Utilities.print("INFO: Verification of list "
                                +   "update won't be executed");
                UpdateServiceList.FIRST_SERVICE_UID = "" 
            }
            else {
                UpdateServiceList.FIRST_SERVICE_UID = String(serviceUID[0])
            }
            UpdateServiceList.manager(['UpdateList'])
        },
        "UpdateList" : function() {
            Utilities.print("Update service list.");
            if (UpdateServiceList.MOVE_POSITION === "") {
                Utilities.print("FUNCTION TO REMOVE SERVICES IS NOT CREATED");
            }
            else {
                ServiceList.moveServices(
                    function(res){
                        UpdateServiceList.manager(['CheckUpdate', res])
                    },
                    UpdateServiceList.FIRST_SERVICE,
                    UpdateServiceList.LAST_SERVICE,
                    UpdateServiceList.MOVE_POSITION,
                    UpdateServiceList.LIST_UID,
                    UpdateServiceList.MEDIA_TYPE
                )
            }
        },
        "CheckUpdate" : function() {
            var api = de.loewe.sl2.table.servicelist.list;
            var servicesQuery = {
                selections:[{field:1, conditionType:1,
                                condition: UpdateServiceList.LIST_UID},
                            {field:7, conditionType:1, 
                                condition: UpdateServiceList.FIRST_SERVICE_UID},
                            {field:21, conditionType:1, 
                                condition: UpdateServiceList.MEDIA_TYPE}],
                fields:[6]
            };
            Utilities.getTableValues(
                function(channelNumber){
                    if (UpdateServiceList.MOVE_POSITION === "") {
                        if (channelNumber == "") {
                            Utilities.print("#VERIFICATION PASSED: List "
                                                +"update is executed.");
                            UpdateServiceList.manager(['EndTest', true])
                        }
                        else {
                            Utilities.print("#VERIFICATION FAILED: List "
                                                +"update is executed.");
                            UpdateServiceList.manager(['EndTest', false])
                        }
                    }
                    else {
                        var newCN = UpdateServiceList.MOVE_POSITION;
                        if (channelNumber == newCN) {
                            Utilities.print("#VERIFICATION PASSED: List "
                                                +"update is executed.");
                            UpdateServiceList.manager(['EndTest', true])
                        }
                        else {
                            Utilities.print("#VERIFICATION FAILED: List "
                                +"update is not executed as expected. "
                                + "New channel number for first service "
                                + "in the block is '" + channelNumber 
                                + "' but expected '" + newCN + "'.");
                            UpdateServiceList.manager(['EndTest', false])
                        }
                    };
                }, 
                api,
                servicesQuery);
        },
        "EndTest" : function(result){
            if (result[0]){
                Utilities.print("#VERIFICATION PASSED: Required Favorite list '"
                            + UpdateServiceList.NEW_LIST + "' is created.")
            }
            UpdateServiceList.END(result[0]||true);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
