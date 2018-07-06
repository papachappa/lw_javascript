include('Utilities.js');

init = function() {
/** @namespace
 * Functions to handle dashboard.
 * @requires Library: {@link Utilities}
*/
Dashboard = {

check_inet_scope: function(){
    var inet_scope = de.loewe.sl2.i32.network.scope;
    var current_value =  inet_scope.getValue();
    if (current_value == 0){
        Utilities.print("#Warning! We have no information about the internet scope yet")
    }
    else if (current_value == 1) {
        Utilities.print("#Warning! Network is not accessible at all")
    }
    else if (current_value == 2) {
        Utilities.print("#Warning! We can reach only local area network")
    }
    else if (current_value == 3) {
        Utilities.print("#INFO. TV can reach wide area network (Internet)")
    }
    else if (current_value == 4) {
        Utilities.print("#Warning! Network is temporary not reachable; we expect a further state change soon.")
    }
    return current_value
},

/**
 * Get filtered fields 
 * @author Anna Klimovskaya
 * @memberof Dashboard
 *
 * @param {function} exitFunc
 * Function will be called on success with list of services
 * as its parameter
 *
 * @param {object} [filters = {}]
 * Dictionary describing "selection" fields values. Its keys are fields
 * numbers in the de.loewe.sl2.table.directory, its values are exact values of
 * corresponding fields that should be satisfied during selection
 * from from the service list
 *
 * @param {array} [fields]
 * Vector of fields should be present in result.
 *
 * @example
 *
 * Structure of filters
 * var filters = {
 *           1: "Loewe Channel"
 * };
 *
 * Structure of fields
 * var fields = [6, 7, 4];
 *
 * @requires Library: {@link Utilities}
 */
getFilteredServicesFromDashboard: function(exitFunc,
                                           filters,
                                           fields) {
                                          
    var fields = fields || [1, 4, 16];
    var filters = filters || {};
    var selections = [ { field: 25, conditionType: 1, condition: "FAV0://default"},
                       { field: 0,  conditionType: 1, condition: "/dashboard"}];
                       
    for (key in filters) {
        selections.push({field: key, conditionType: 1,
                         condition: filters[key]});
    }
    var itemsQuery  =  {
        selections:   selections,
        fields:       fields,
        orders:       [ {field: 1, direction: 1} ]
    };

    var api = de.loewe.sl2.table.directory;
    
    Utilities.print("Get dashboard services...");
    Utilities.getTableValues(exitFunc, api, itemsQuery);
},

/**
 * Refactor dashboard URL to display it readable view and make is 
 * available for comparison with expected result
 * @author Anna Klimovskaya
 * @memberof Dashboard
 *
 * @param {array} initialTable
 * dashboard table in view as returned by getFilteredServicesFromDashboard
 * [[[name],[URI]],
 *  [[name],[URI]],
 *  [[name],[URI]],
 * ]
 *
 * result:
 * [[[name],[URI],[SID],[TSID],[ONID]],
 *  [[name],[URI],[SID],[TSID],[ONID]],
 *  [[name],[URI],[SID],[TSID],[ONID]],
 * ]
 * if URI containes  
 *
 * @requires Library: {@link Utilities}
 */
refactoring: function (initialTable, AtributIndex, URIndex, indexIndex) {
    var AtributIndex = AtributIndex || 3;
    var URIndex = URIndex || 5;
    var indexIndex = indexIndex || 6;
    var ret = [];
    var reg = /onid=\d+&sid=\d+&tsid=\d+/;//DVB triplet
//  var last = ; //number of fields
/* Following regexp is used to skip check of file name for cached images.
This was done because same images have different names on different TV sets.
*/
    var regImage = /\/image-cache\//;
    var regLink = /\/dashboard.*$/;
    
    for( var i = 0; i < initialTable.length; i++ ) {
//Do not delete String below, otherwise comparing will be broken
//dashboard table has empty index, index will be added artificial
// to verify item order
        initialTable[i][indexIndex] = String(i+1);
//If DVB triplet is present in URI -> it is dvb services. 
//Streaming parameters can be different, so use only triplet for comparison
        if( initialTable[i][URIndex].match(reg)) {
            initialTable[i][URIndex] = String(reg.exec(initialTable[i][URIndex]));
        }
//Dashboard icon validation is commented till we have clear understanding 
//how/where icon is stored and how URI for it created
/*        if( initialTable[i][AtributIndex].match(regImage)) {
            initialTable[i][AtributIndex]
                = String(regImage.exec(initialTable[i][AtributIndex]));
        }
*/
        initialTable[i][AtributIndex] = 'DNC';
        
        if( initialTable[i][AtributIndex].match(regLink)) {
            initialTable[i][AtributIndex]
                = String(regLink.exec(initialTable[i][AtributIndex]));
        }
        if( initialTable[i][URIndex].match(regLink)) {
            initialTable[i][URIndex]
                = String(regLink.exec(initialTable[i][URIndex]));
        }
    }
    
    return initialTable;
},

/**
 * Delete item from dashboard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Dashboard
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {array} servicesUIDs
 * List UIDs of services that should be removed.
 * @requires Library: {@link Utilities},
*/
removeItem: function(exitFunc, itemUID, failFunc) {
    var failFunc = failFunc||exitFunc;
    var removeTimer = 0;

    var ACTION_DASHBOARD_REMOVE = de.loewe.sl2.action.dashboard.remove;
    ACTION_DASHBOARD_REMOVE.onError.connect(onDeleteError);
    ACTION_DASHBOARD_REMOVE.onResult.connect(onDeleteResult);

    function onDeleteError() {
        ACTION_DASHBOARD_REMOVE.onError.disconnect(onDeleteError);
        window.clearTimeout(removeTimer);
        Utilities.print("#VERIFICATION FAILED: Service removing failed.");
        failFunc();
    }

    function onTimeout() {
        window.clearTimeout(removeTimer);
        ACTION_DASHBOARD_REMOVE.onError.disconnect(onDeleteError);
        ACTION_DASHBOARD_REMOVE.onResult.disconnect(onDeleteResult);
        Utilities.print("WARN: Call of action to remove item from dashboard "
                        +"does not return response in 10 sec.");
        exitFunc();
    }

    function onDeleteResult() {
        ACTION_DASHBOARD_REMOVE.onResult.disconnect(onDeleteResult);
        window.clearTimeout(removeTimer);
        Utilities.print("#VERIFICATION PASSED: Service was removed successfully.");
        exitFunc();
    }

    Utilities.print("Removing item...");
    ACTION_DASHBOARD_REMOVE.call(String(itemUID));
    removeTimer = window.setTimeout(onTimeout, 10000);
},

/**
 * Add item to dashboard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Dashboard
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {array} servicesUIDs
 * List UIDs of services that should be removed.
 * @requires Library: {@link Utilities},
*/
addItem: function(exitFunc, itemUID, type, failFunc) {
    var failFunc = failFunc||exitFunc;
//has to be global to do not bind to function context 
    addTimer = 0;
//Change type from serviceslist table to expected values
//If in futer application has to be added, use some special type that update
//here to value 4
    if (type == 4) {
        var type = 1
    }
    if (type == 8) {
        var type = 2
    }

    var ACTION_DASHBOARD_ADD = de.loewe.sl2.action.dashboard.add;
    ACTION_DASHBOARD_ADD.onError.connect(onAddError);
    ACTION_DASHBOARD_ADD.onResult.connect(onAddResult);

    function onAddError() {
        ACTION_DASHBOARD_ADD.onError.disconnect(onAddError);
        window.clearTimeout(addTimer);
        Utilities.print("#VERIFICATION FAILED: Service adding is failed.");
        window.setTimeout(failFunc, 1000);
    }

    function onTimeout() {
        window.clearTimeout(addTimer);
        ACTION_DASHBOARD_ADD.onResult.disconnect(onAddResult);
        ACTION_DASHBOARD_ADD.onError.disconnect(onAddError);
        Utilities.print("WARN: Call of action to add item to dashboard "
                        +"does not return response in 10 sec.");
        window.setTimeout(exitFunc, 1000);
    }

    function onAddResult() {
        ACTION_DASHBOARD_ADD.onResult.disconnect(onAddResult);
        window.clearTimeout(addTimer);
        Utilities.print("#VERIFICATION PASSED: Service was added successfully.");
        window.setTimeout(exitFunc, 1000);
    }

    Utilities.print("Adding item...");
    ACTION_DASHBOARD_ADD.call(["cha0://default", itemUID, type]);
    addTimer = window.setTimeout(onTimeout, 10000);
}

}
}
