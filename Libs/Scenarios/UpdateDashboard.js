include('../Utilities.js');
include('../ServiceList.js');
include('../Dashboard.js');

init = function () {

/** @namespace
* Test script to update existing dashboard.
* @requires Library: {@link Utilities}, {@link ServiceList}, {@link Dashboard}
*/
UpdateDashboard = {
    
REMOVE_ITEMS: [],
ADD_SERVICES: [],
SWAP_ITEMS: [],
CURRENT:[],
END: function(){            
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof UpdateDashboard
 * 
 * @param {array} removeDashboardItems
 * Array of items index of currend dashboard that should be removed.
 * ["all"] key can be used to remove all items from dashboard.
 * 
 * @param {array} addServices
 * Array of dvb services that should be added to the current dashboard.
 * Curent lirary imlementation supports adding only dvb services 
 * form overall list. Eash services should be described in following way:
 * ["Name","Type", "SID","TSID","ONID"].
 * 
 * @param {array} swapDashboardItems
 * Added for future needs, curntly not implemented.
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set UpdateDashboard.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (removeDashboardItems,
                     addServices,
                     swapDashboardItems,
                     exitFunc) {

    if ( typeof(exitFunc) == "function") {
        UpdateDashboard.END = exitFunc;
    }
    
    if (Array.isArray(removeDashboardItems)) {
        UpdateDashboard.REMOVE_ITEMS = removeDashboardItems;
    }
    else {
        Utilities.print("#ERROR: List of items that should be removed"
            + " is not specified as expected. Test will be terminated.");
        Utilities.print("INFO: removeDashboardItems should be specifyied"
            +" as array. ['all'] to remove all items, [] to do not remove"
            + " any items." );
        UpdateDashboard.END(false);
    }
    
    if (Array.isArray(addServices)) {
        UpdateDashboard.ADD_SERVICES = addServices;
    }
    else {
        Utilities.print("#ERROR: List of services that should be added"
            + " is not specified as expected. Test will be terminated.");
        Utilities.print("INFO: addServices should be specifyied"
            +" as array. [] to do not add any services." );
        UpdateDashboard.END(false);
    }
    
    if (Array.isArray(swapDashboardItems)) {
        UpdateDashboard.SWAP_ITEMS = swapDashboardItems;
    }
    else {
        Utilities.print("#ERROR: List of services that should be swaped"
            + " is not specified as expected. Test will be terminated.");
        Utilities.print("INFO: swapDashboardItems should be specifyied"
            +" as array. [] to do not execute any swaps." );
        UpdateDashboard.END(false);
    }
    
    if ( typeof(exitFunc) == "function") {
        UpdateDashboard.manager(["GetListUID"]);
    }
    else {
        UpdateDashboard.manager(["Connect"]);
    }

},

/**
 * Update existinf dashboard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof UpdateDashboard
 * @requires Library: {@link Utilities}, {@link ServiceList}, 
 * {@link Dashboard}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Remove items from dashboard.");
            Utilities.print("3. Add services to dashboard.");
            Utilities.print("4. Swap services in dashboard.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                UpdateDashboard.manager(["GetDashboard"]);
            });
        },
        "GetDashboard" : function() {
            if (UpdateDashboard.REMOVE_ITEMS.length != 0) {
                Dashboard.getFilteredServicesFromDashboard(
                    function(services){
                        UpdateDashboard.manager(["GlobalUIDs",services]);
                    },
//no filters, ger all services
                    {},
                    [1, 20]);   
            }
            else {
                Utilities.print("No items is requested to be removed"
                    +" from dashboard.");
                UpdateDashboard.manager(["GetServiceURI"]);
            }
        },
        "GlobalUIDs" : function(services) {
//FIXME: quick and dirty this step only save service in global context
            UpdateDashboard.CURRENT = services[0];
            UpdateDashboard.manager(["RemoveService"]);
        },
        "RemoveService" : function() {
            if (UpdateDashboard.REMOVE_ITEMS.length != 0) {
//remove last item from array if items index 
                var last = UpdateDashboard.REMOVE_ITEMS.splice(
                            UpdateDashboard.REMOVE_ITEMS.length-1,
                            UpdateDashboard.REMOVE_ITEMS.length);
//split result is array, we need string 
                last = String(last[0])
                Utilities.print("Remove '" 
                        + UpdateDashboard.CURRENT[last][0]
                        + "' item from dashboard.");
                Dashboard.removeItem(
                    function(){ 
//repeat removing till array of item index is not empty 
                        UpdateDashboard.manager(["RemoveService"]);
                    },
//remove items from the end of requested item list
                    String(UpdateDashboard.CURRENT[last][1]),
                    function(){ 
                        Utilities.print("#ERROR: Test is terminated");
                        UpdateDashboard.manager(["EndTest", false]);
                    }
                )
            }
            else {
                Utilities.print("All requested items are removed");
                UpdateDashboard.manager(["GetServiceURI"]);
            }
        },
        "GetServiceURI" : function() {
            if (UpdateDashboard.ADD_SERVICES.length != 0) {
                    Utilities.print("Get URI of '" 
                    + UpdateDashboard.ADD_SERVICES[0][0]
                    + "' to add on dashboard.")
                
                var triplet = "onid=" + UpdateDashboard.ADD_SERVICES[0][4]
                            + "&sid=" + UpdateDashboard.ADD_SERVICES[0][2]
                            + "&tsid=" + UpdateDashboard.ADD_SERVICES[0][3]
                    
                var serviceQuery = {
                    selections:   
                        [{field:2, conditionType:2, condition: triplet}],
                    fields: [7],
                    orders: [{field: 6, direction: 1}]
                };

                var listAPI = de.loewe.sl2.table.servicelist.list;

                Utilities.print("Get services URI...");
                Utilities.getTableValues(
                    function(uri){ 
                        UpdateDashboard.manager(["AddService", uri]);
                    }, 
                    listAPI, 
                    serviceQuery,
                    function(uri){
                        Utilities.print("Test is terminated."); 
                        UpdateDashboard.manager(["EndTest",false]);
                    },
                    100);
            }
            else {
                UpdateDashboard.manager(["EndTest",false]);
            }
        },
        "AddService" : function(uri) {
            var uri = uri[0];
            Utilities.print("Add '" 
                    + UpdateDashboard.ADD_SERVICES[0][0]
                    + "' to the dashboard.");
            if (uri.lenght > 1){
                    Utilities.print("WARN:Sereral services with same DVB"
                    + " triplet are found. First one will be added.");
            }
            Dashboard.addItem(
            function(){ 
//remove first item from array of services that will be added 
                UpdateDashboard.ADD_SERVICES.splice(0,1);
//repeat adding till array of services is not empty 
                UpdateDashboard.manager(["GetServiceURI"]);
            },
            String(uri),
            String(UpdateDashboard.ADD_SERVICES[0][1]),
            function(){ 
                Utilities.print("#ERROR: Test is terminated");
                UpdateDashboard.manager(["EndTest",true]);
            }
        )   
        },
        "EndTest" : function(result){
            if (result[0]){
                Utilities.print("ATTENTION!!! SWAP IS NOT IMPLEMENTED");
                Utilities.print("#VERIFICATION PASSED: Dashboard is "
                + "updated according to request.");
            }
            UpdateDashboard.END(result[0]||true);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
