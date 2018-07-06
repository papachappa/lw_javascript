include('Utilities.js');
include('Compare.js');

init = function() {

/** @namespace
 * Functions to get and update services and service list
 * @requires Library: {@link Utilities}, {@link Compare},
*/
ServiceList = {

/**
 * Get UIDs of service lists by list name
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {string} [serviceListName=""]
 * Name of service lists
 * If parameter is omitted, all UIDs will be returned.
 * @return {object} List of service list UIDs.
 * UIDs list will be passed to exitFunc as input parameter.
 * @example
 * // Get UIDs of lists that contain "a" in their names
 * ServiceList.getUidOfServiceListByListName(exitFunc,"a")
 * @requires Library: {@link Utilities},
*/
getServicelistUID: function (exitFunc, serviceListName) {
    // Parse by name added for default service lists,
    // that cannot be selected by name in queryForList
    var serviceListName = serviceListName||"";
    var api = de.loewe.sl2.table.favouritelist.list;
    // Get all lists
    var queryForList  =  {
        selections:   [ { field: 0, conditionType: 2, condition: ""}],
        // Get name and UUID
        fields:       [0,1],
        orders:       [ {field: 0, direction: 1} ]
    };
    function parseByName(allLists) {
        var lists = [];
        if (serviceListName == "") {
            serviceListName = "#3052"; //Return overall list
        }
        allLists.forEach(
            function(item) {
                if (item[0] == serviceListName) {
                    lists.push(item[1]);
                }
            }
        );
        exitFunc(lists);
    }

    Utilities.print("Get list UID...");
    Utilities.getTableValues(parseByName, api, queryForList);
},

/**
 * Get data for all services in list by list UID.
 * Service name, channel number, service ID, stream id,
 * network id, mediatype, visible and selectable flags are requested.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished.
 * @param {string} serviceListUID
 * Service list UID
 * @param {array} [requestedFields=[0,6,8,9,10,21,24,25]]
 * List of required fields from service list
 * @return {object} List of services sorted according to channel number
 * and service media type.
 * Service list will be passed to exitFunc as input parameter.
 * @example
 * ServiceList.getServicesFromList(exitFunc,UID)
 * //returned structure
 * serviceList = [
 * //[Name,Ch.num,SericeID,StreamID,NetwokID,Type,Visability,Selecability]
 * [Service1,1,6000,18,22,4,1,1],
 * [Service2,1,6510,18,22,8,1,1]
 * ]
 * @requires Library: {@link Utilities},
*/
getServicesFromList: function (exitFunc, serviceListUID, requestedFields) {
    //create string from object
    var serviceListUID = serviceListUID.toString();
    var requestedFields = requestedFields || [0,6,8,9,10,21,24,25];

    var servicesQuery = {
        selections:   [{field:1, conditionType:1, condition:serviceListUID}],
        fields:       requestedFields,
        orders:       [{field: 6, direction: 1},{field: 21, direction: 1}]
    };

    var api = de.loewe.sl2.table.servicelist.list;

    Utilities.print("Get services...");
    Utilities.getTableValues(exitFunc, api, servicesQuery);
},
    /**
     * Get filtered services from service list under interest in the
     * specified format
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof ServiceList
     *
     * @param {string} [listUID]
     * UUID of the service list under interest.
     *
     * @param {function} exitFunc
     * Function will be called on success with list of services
     * as its parameter
     *
     * @param {object} [filters = {}]
     * Dictionary describing "selection" fields values. Its keys are fields
     * numbers in the service list, its values are exact values of
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
     *           SL_Fields.MEDIA_TYPE: MediaType.TV
     * };
     *
     * Structure of fields
     * var fields = [SL_Fields.SERVICE_NAME, SL_Fields.CHANNEL_NUMBER,
     *                     SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID];
     *
     * @requires Library: {@link Utilities}
     */
    getFilteredServicesFromList: function(exitFunc,
                                          listUID,
                                          filters,
                                          fields) {
        var fields = fields || [0,6,8,9,10,21,24,25];
        var selections = [{field:1, conditionType:1, condition: listUID}];
        for (key in filters) {
            selections.push({field: key, conditionType: 1,
                             condition: filters[key]});
        }
        var servicesQuery = {
            selections:  selections,
            fields: fields,
            orders: [{field: 21, direction: 1}]
        };

        var api = de.loewe.sl2.table.servicelist.list;

        Utilities.print("Get services...");
        Utilities.getTableValues(exitFunc, api, servicesQuery);
    },
/**
 * Remove existing service list.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @requires Library: {@link Utilities},
*/
removeServiceList: function (exitFunc) {
    var timerID = 0;
    var deleteServiceList = de.loewe.sl2.table.servicelist.list.clear;

    function onDelResult() {
        window.clearTimeout(timerID);
        deleteServiceList.onResult.disconnect(onDelResult);
        deleteServiceList.onError.disconnect(onDelError);
        Utilities.print("Service list is deleted.");
        exitFunc();
    }

    function onDelError() {
        window.clearTimeout(timerID);
        deleteServiceList.onResult.disconnect(onDelResult);
        deleteServiceList.onError.disconnect(onDelError);
        Utilities.print("#VERIFICATION FAILED: Service list was not removed.");
        exitFunc();
    }

    function onTimeout() {
        window.clearTimeout(timerID);
        deleteServiceList.onResult.disconnect(onDelResult);
        deleteServiceList.onError.disconnect(onDelError);
        Utilities.print("#ERROR: Call of action for delete service list does not "
                        +"return response in 10 sec.");
        exitFunc();
    }

    Utilities.print("Removing service list...");
    deleteServiceList.onResult.connect(onDelResult);
    deleteServiceList.onError.connect(onDelError);
    deleteServiceList.call();
    timerID = window.setTimeout(onTimeout, 10000);

},
/**
 * Remove favorite list.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that will be called on success
 * @param {string} listID
 * ID of a favorite list to be removed
 * @param {function} [failFunc=exitFunc(false)]
 * Function that will be called on failure
 * @requires Library: {@link Utilities},
*/
removeFavoriteList: function (exitFunc, listID, failFunc) {
    var failFunc = failFunc || exitFunc;
    var timerID = 0;
    var deleteFavoriteList = de.loewe.sl2.action.favouritelist.remove;

    function onDelResult() {
        window.clearTimeout(timerID);
        deleteFavoriteList.onResult.disconnect(onDelResult);
        deleteFavoriteList.onError.disconnect(onDelError);
        Utilities.print("The favorite list is removed.");
        exitFunc(true);
    }

    function onDelError() {
        window.clearTimeout(timerID);
        deleteFavoriteList.onResult.disconnect(onDelResult);
        deleteFavoriteList.onError.disconnect(onDelError);
        Utilities.print("#ERROR: The favorite list was not removed.");
        failFunc(false);
    }

    function onTimeout() {
        window.clearTimeout(timerID);
        deleteFavoriteList.onResult.disconnect(onDelResult);
        deleteFavoriteList.onError.disconnect(onDelError);
        Utilities.print("#ERROR: Call of action for delete service list did"
                        +" not return in 10 sec.");
        failFunc(false);
    }

    Utilities.print("Removing favorite list...");
    deleteFavoriteList.onResult.connect(onDelResult);
    deleteFavoriteList.onError.connect(onDelError);
    deleteFavoriteList.call(listID);
    timerID = window.setTimeout(onTimeout, 10000);
},

/**
 * Get UID of last created service list that contains conflicted services.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @return {object} Service list UID.
 * UID will be passed to exitFunc as input parameter.
 * @example
 * // Call print function when UID is received
 * ServiceList.getUIDofNewListWithConflict(function(UID){Utilities.print(UID)})
 * @requires Library: {@link Utilities},
*/
getUIDofNewListWithConflict: function (exitFunc) {
    var api = de.loewe.sl2.table.favouritelist.list;

    var listUIQuery = {
        selections: [
        // 1024 list of last scan
            { field: 2, conditionType: 1, condition: 1024},
        //512 list with lcn conflict
            { field: 2, conditionType: 1, condition: 512}
        ],
        fields: [1], //Get a favorite list ID
        orders: [{field: 0, direction: 1}]
    }

    Utilities.print("Get UID of last created list with LCN conflict...");
    Utilities.getTableValues(exitFunc, api, listUIQuery);
},

/**
 * Get list of conflicted LCNs.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {string} listUID
 * UID of service list with conflicted services.
 * @return {object} List of conflicted LCNs.
 * LCNs list will be passed to exitFunc as input parameter.
 * @requires Library: {@link Utilities},
*/
getConflictedLCNs: function (exitFunc, listUID){
    var api = de.loewe.sl2.table.servicelist.list;

    var queryConflictedServices  =  {
        selections:   [
            { field: 1, conditionType: 1, condition: listUID },
            // "32768" - UID of service list of conflicting LCNs
            { field: 3, conditionType: 7, condition: 32768 }
        ],
        fields:       [6, 21],
        orders:       [{field: 6, direction: 1}]
    };

    Utilities.print("Get conflicted LCNs and media types...");
    Utilities.getTableValues(exitFunc, api, queryConflictedServices);
},

/**
 * Get all conflicted services by list UID and conflicted LCNs.
 * Service name, channel number, service ID, stream id,
 * network id, mediatype, visible and selectable flags are requested.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished.
 * @param {string} listUID
 * UID of services list that has conflicted services.
 * @param {array} conflictedLCNs
 * List of LCNs that have conflicted services.
 * @return {object}  List of conflicted services sorted by channel number.
 * Service list will be passed to exitFunc as input parameter.
 * @example
 * // get conflicted services and print result.
 * ServiceList.getConflictedServices(exitFunc, [1,2])
 * //returned structure
 * serviceList = [
 * //[Name,Ch.num,SericeID,StreamID,NetwokID,Type,Visability,Selecability]
 * [Service1,1,6000,18,22,4,1,1],
 * [Service2,850,6510,18,22,4,1,1],
 * [Service1,2,6032,18,22,4,1,1],
 * [Service2,851,634,18,22,4,1,1],
 * ]
 * @requires Library: {@link Utilities},
*/
getConflictedServices: function (exitFunc, listUID, conflictedLCNs, request){
    var api = de.loewe.sl2.table.servicelist.list;
    var allService = [];
    var defaultRequest = [0,6,8,9,10,21,24,25];
    var currentRequest = request || defaultRequest;

    function getServices (i) {
        if (i < conflictedLCNs.length){
            var queryConflictedServices = {
                selections:   [
                    { field: 1, conditionType: 1, condition: listUID},
                    { field: 32, conditionType: 1, condition: conflictedLCNs[i][0]},
                    { field: 21, conditionType: 1, condition: conflictedLCNs[i][1]}
                ],
                //~ fields:       [0],
                fields:       currentRequest,
                orders:       [{field: 6, direction: 1}]
            };
            function onQueryReady(count){
                query.onRows.connect(this, onRows);
                query.readAllRows()
            }

            function onRows(id, rows){
                allService = allService.concat(rows.map(function(row){return row;}))
                query.onQueryReady.disconnect(this, onQueryReady);
                i++
                getServices (i)
            }

            var query = api.createQuery(queryConflictedServices);
            query.onQueryReady.connect(this, onQueryReady);
            query.execute();

        }
        else {
            exitFunc(allService);
        }

    }

    Utilities.print("Get conflicted services...");
    getServices (0)

},

/**
 * Swap all required services.
 * This function can get list of swaps for execution
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {array} executeSwap
 * List of swaps that should be executed. See example to clarify array structure.
 * @param {string} listUID
 * UID of service list there services are placed.
 * @example
 * var executeSwap =[
        {
            type:1, //media type 1-TV, 2-Radio
            lcns:[2,851] //
        },
        {
            type:2 //media type 1-TV, 2-Radio
            lcns:[1,850] //
        },
    ];
 * @requires Library: {@link Utilities},
*/
swapServices: function (exitFunc, executeSwap, listUID) {
    //FIXME create function to create empty elements
    var swappingIndex=0;
    var swapApi = de.loewe.sl2.action.servicelist.swap;

    function swap (i) {
        if (i < Utilities.numberOfElements(executeSwap)){
            var mediaType = executeSwap[i]["type"];
            // convert mediatype from values in serviceslist.table
            // (4-TV 8-Radio) to 1 and 2 that expect this api
            if ( mediaType == 4 ){
                mediaType = 1;
            }
            if ( mediaType == 8 ){
                mediaType = 2;
            }
            Utilities.print("Swapping services of type "
                            + mediaType
                            + " with channel numbers "
                            + executeSwap[i]["chanNumbers"][0]
                            + " and " + executeSwap[i]["chanNumbers"][1] + "...");
            swapApi.call([listUID, mediaType,
                                executeSwap[i]["chanNumbers"][0],
                                executeSwap[i]["chanNumbers"][1]]);
        }
    }

    function onSwapError(){
        Utilities.print("#VERIFICATION FAILED: Swap was executed with error."
                        + " Swapping is terminated.");
        exitFunc()
    }

    function onSwapResult(){
        swappingIndex++
        if (swappingIndex < Utilities.numberOfElements(executeSwap)) {
            window.setTimeout(function(){swap(swappingIndex)},1000);
        }
        else{
            Utilities.print("#VERIFICATION PASSED: All required swaps are executed.");
            exitFunc()
        }
    }

    if (Utilities.numberOfElements(executeSwap) == 0){
        Utilities.print("No swapping is expected."
                        + " Default channel numbers will be accepted.")
        exitFunc()
    }
    else{
        swapApi.onResult.connect(this, onSwapResult);
        swapApi.onError.connect(this, onSwapError);
        swap(0)
    }
},

/**
 * Delete services from all service lists.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {array} servicesUIDs
 * List UIDs of services that should be removed.
 * @requires Library: {@link Utilities},
*/
removeServices: function(exitFunc, servicesUIDs) {
    var timerID = 0;
    timerID = window.setTimeout(onTimeout, 10000);
    SCAN_REMOVE_SERVICES_API = de.loewe.sl2.action.servicelist.delete.services.permanently;
    SCAN_REMOVE_SERVICES_API.onError.connect(onDeleteError);
    SCAN_REMOVE_SERVICES_API.onResult.connect(onDeleteResult);

    function onDeleteError() {
        window.clearTimeout(timerID);
        SCAN_REMOVE_SERVICES_API.onError.disconnect(onDeleteError);
        SCAN_REMOVE_SERVICES_API.onResult.disconnect(onDeleteResult);
        Utilities.print("#VERIFICATION FAILED: Services removal failed.");
        exitFunc();
    }

    function onTimeout() {
        window.clearTimeout(timerID);
        SCAN_REMOVE_SERVICES_API.onError.disconnect(onDeleteError);
        SCAN_REMOVE_SERVICES_API.onResult.disconnect(onDeleteResult);
        Utilities.print("#ERROR: Call of action for delete services does not "
                        +"return response in 10 sec.");
        exitFunc();
    }

    function onDeleteResult() {
        window.clearTimeout(timerID);
        SCAN_REMOVE_SERVICES_API.onError.disconnect(onDeleteError);
        SCAN_REMOVE_SERVICES_API.onResult.disconnect(onDeleteResult);
        Utilities.print("#VERIFICATION PASSED: Services were removed successfully.");
        exitFunc();
    }

    Utilities.print("Removing services...");
    SCAN_REMOVE_SERVICES_API.call(servicesUIDs);
},

/**
 * Create new service list.
 * List creation is verified by checking if lists number is increased
 * ATTENTION! Current function allows to create service list with name that already
 * is used. TV UI does not allow this!
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * Exit function get new List ID as input parameter
 * @param {string} listName
 * Name of new list.
 * @param {1|2} mediaType
 * 1-list of TV services, 2-list of radio services
 * @param {function} failFunc
 * Function that should be called if list creation has unexpected result
 * @requires Library: {@link Utilities},
*/
createNewList: function(exitFunc, listName, mediaType, failFunc) {
    var failFunc = failFunc||exitFunc;
    var exitFunc = exitFunc;
    var timerID = 0;

    if ( typeof(SCAN_CREATE_NEW_LIST_API) == "undefined") {
        SCAN_CREATE_NEW_LIST_API = dataModel.de
                                    .loewe.sl2.action.favouritelist.add;
        SCAN_CREATE_NEW_LIST_API.onError.connect(function(){
            Utilities.print("#ERROR: dataModel.de.loewe.sl2.action."
                            + "favouritelist.add reported about error "
                            + "during services list creation.");
            checkListCreation()});
        SCAN_CREATE_NEW_LIST_API.onResult.connect(function(){
            setTimeout(checkListCreation, 1000)});
    }

    var initialUIDS;
    var favouritelist = de.loewe.sl2.table.favouritelist.list;
//request to get number of service lists with required name
    var uidsRequest  =  {
        selections:   [ { field: 0, conditionType: 1, condition: listName} ],
        fields:       [1],
        orders:       [ {field: 0, direction: 1} ]
    };

    function checkListCreation(){
        window.clearTimeout(timerID);
        var newListUID;
        Utilities.getTableValues(function(UIDS){
            if (UIDS.length == initialUIDS.length+1) {
                Utilities.print("INFO: New services list '"
                                + listName + "' is created.");
                Utilities.print("INFO: " + UIDS.length + " service"
                            + " list(s) '" + listName + "' exist(s).");
//I don't know why this stupid javascript can't find string in array of numbers
                for (var key in initialUIDS){
                    initialUIDS[key]=initialUIDS[key].toString()
                }
//find new UID
                UIDS.forEach(function(entry){
                        if (initialUIDS.indexOf(String(entry)) == -1){
                            newListUID = entry;
                        }
                    });
                exitFunc(newListUID)
            }
            else {
                Utilities.print("WARN: Number of service lists '"
                                + listName+"' is " + UIDS.length
                                + " instead of expected "
                                + initialUIDS.length + "+1." );
                failFunc()
            }
        }, favouritelist, uidsRequest);
    }

    Utilities.print("Create new service list...");
    Utilities.print("Check if list with required name is exist...");
    Utilities.getTableValues( function(UIDS){
            initialUIDS = UIDS;
            SCAN_CREATE_NEW_LIST_API.call([listName, mediaType]);
            timerID = window.setTimeout(function(){
                Utilities.print("#ERROR: dataModel.de.loewe.sl2.action."
                        + "favouritelist.add did not report about "
                        + "service list creation during 10sec.");
                checkListCreation()}, 10000);},
        favouritelist, uidsRequest);
},

/**
 * Move the block of services in the list.
 * @author Alexey Murashkin amurashkin@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {number} firstService
 * The first service in the block for move.
 * @param {number} lastService
 * The last service in the block for move.
 * @param {number} movePosition
 * The position where the block of services will be move.
 * @param {string} listUID
 * UID of service list that should be updated.
 * @param {1|2|4|8} mediaType
 * 1,4 - list of TV services, 2,8 - list of radio services
 * @param {function} failFunc
 * Function that should be called if list update has unexpected result
 * @requires Library: {@link Utilities}
*/

moveServices: function (exitFunc, 
                        firstService,
                        lastService,
                        movePosition,
                        listUID,
                        mediaType,
                        failFunc) {
    var failFunc = failFunc || exitFunc;
    var timerID = 0;
    var moveServicesInList = de.loewe.sl2.action.servicelist.move;   
    // convert mediatype from values in serviceslist.table
    // (4-TV 8-Radio) to 1 and 2 that expect this api
    if ( mediaType == 4 ){
        mediaType = 1;
    }
    if ( mediaType == 8 ){
        mediaType = 2;
    }

    function onMoveResult() {
        window.clearTimeout(timerID);
        Utilities.print("The move action is executed.");
        exitFunc(true);
    }

    function onMoveError() {
        window.clearTimeout(timerID);
        Utilities.print("#ERROR: Services were NOT moved.");
        failFunc(false);
    }

    function onTimeout() {
        window.clearTimeout(timerID);
        Utilities.print("#ERROR: Call of action for the moving of services"
                        + " did not return in 10 sec.");
        exitFunc(false);
    }

    Utilities.print("Moving of services...");
    moveServicesInList.onResult.connect(this, onMoveResult);
    moveServicesInList.onError.connect(this, onMoveError);
    moveServicesInList.call([firstService, lastService, movePosition, listUID, mediaType]);
    timerID = window.setTimeout(onTimeout, 10000);
},

/**
 * Add services to favorite list.
 * List update is executed by services UIDs comparison
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {1|2|4|8} mediaType
 * 1,4 - list of TV services, 2,8 - list of radio services
 * @param {string} listUID
 * UID of favorite service list that should be updated.
 * @param {array} servicesUIDs
 * UIDs of services that should be added to the list.
 * @param {function} failFunc
 * Function that should be called if list update has unexpected result
 * @requires Library: {@link Utilities},{@link Compare}
*/
updateFavoriteList: function(exitFunc, mediaType, listUID, servicesUIDs, failFunc) {
    var failFunc = failFunc||exitFunc;
    var exitFunc = exitFunc;
    var timerID = 0;
    if (mediaType == 4) {
        var mediaType = 1
    }
    if (mediaType == 8) {
        var mediaType = 2
    }

    if ( typeof(SCAN_UPDATE_FAVORITE_LIST_API) == "undefined") {
        SCAN_UPDATE_FAVORITE_LIST_API = dataModel.de
                                .loewe.sl2.action.favouritelist.update;
        SCAN_UPDATE_FAVORITE_LIST_API.onError.connect(function(){
            Utilities.print("#ERROR: dataModel.de.loewe.sl2.action."
                            + "favouritelist.update reported about error"
                            + " during adding services to list.");
            checkListUpdate()});
        SCAN_UPDATE_FAVORITE_LIST_API.onResult.connect(function(){
            setTimeout(checkListUpdate, 1000)});
    }

    function checkListUpdate(){
        window.clearTimeout(timerID);
        ServiceList.getServicesFromList(function(UIDsNewList){
            var differences = Compare.compareArrays([UIDsNewList],
                                                    [servicesUIDs]);

            if (differences[0].length == 0 && differences[1].length == 0){
                Utilities.print("INFO: Favorite list was "
                                + "updated according to request.");
                Utilities.print("INFO: Favorite list contains "
                                + UIDsNewList.length +" services.");
                exitFunc();
            }
            else{
                if (differences[0].length != 0){
                    Utilities.print("WARN: Next services (UIDS) were not"
                                    + " added to favorite list:"
                                    + differences[0] + ".");
                }
                if (differences[1].length != 0){
                    Utilities.print("WARN: Favorite list contains "
                                    + "unexpected services with UIDs:"
                                    + differences[1] + ".");
                }
                failFunc();
            }

        }, listUID, [7]);
    }

    Utilities.print("Update favorite service list...");
// create request to add services
//  api.call([listUID,mediaType,servicesUIDs]) doesn't work
    var addLine = [listUID, mediaType];
    servicesUIDs.forEach(function(entry){
        addLine.push(String(entry))
        })
    SCAN_UPDATE_FAVORITE_LIST_API.call(addLine);
    timerID = window.setTimeout(function(){
            Utilities.print("#ERROR: dataModel.de.loewe.sl2.action."
                        + "favouritelist.update did not report about "
                        + "service list update during 10sec.");
            checkListUpdate()}, 10000)
},

/**
 * Set attribute.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {number} firstService
 * The first service in the block for move.
 * @param {number} lastService
 * The last service in the block for move.
 * @param {number} movePosition
 * The position where the block of services will be move.
 * @param {string} listUID
 * UID of service list that should be updated.
 * @param {1|2|4|8} mediaType
 * 1,4 - list of TV services, 2,8 - list of radio services
 * @param {function} failFunc
 * Function that should be called if list update has unexpected result
 * @requires Library: {@link Utilities}
*/

setAttribute: function (exitFunc,
                        attribute,
                        value,
                        servicesUUIDS,
                        failFunc) {
    var failFunc = failFunc || exitFunc;
    var timerID = 0;
    var attributeAPI = dataModel.de.loewe.sl2.action.servicelist
                            .set.services.attribute;   
    var arguments = [attribute, value];
    for (var i = 0; i < servicesUUIDS.length; i++) {
        arguments.push(servicesUUIDS[i]);
    }

    function onSetResult() {
        window.clearTimeout(timerID);
        Utilities.print("Attribute is set to required value.");
        exitFunc(true);
    }

    function onSetError() {
        window.clearTimeout(timerID);
        Utilities.print("#ERROR: The attribute was not set.");
        failFunc(false);
    }

    function onSetTimeout() {
        window.clearTimeout(timerID);
        Utilities.print("#ERROR: Call of action to set attribute for services "
                        +"did not return response in 10 sec.");
        exitFunc(false);
    }

    Utilities.print("Set attribute...");
    attributeAPI.onResult.connect(this, onSetResult);
    attributeAPI.onError.connect(this, onSetError);
    attributeAPI.call(arguments);
    timerID = window.setTimeout(onSetTimeout, 10000);
},

/**
 * URI refactoring.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ServiceList
 * @param {array} list
 * array in [[]] format - list of services
 * @param {number} uriIndex
 * Field index there URI can be found
 * @return {array} refactored services list.
 * //returned structure
 * serviceList = [
 * //[initial fields + new fields in order as in ListStreamingParameters]
 * [ "01_FTA", "1", "1", "1", "133", "4", "1", "1", "DNC", "474000",
 *  "8", "4000", "NA", "3", "NA", "NA", "NA", "NA", "1", "NA", "NA", "NA", "NA" ],
 * [ "02_Scram", "2", "2", "1", "133", "4", "1", "1", "DNC", "474000",
 *  "8", "4000", "NA", "3", "NA", "NA", "NA", "NA", "1", "NA", "NA", "NA", "NA" ]
 * ]
 * @requires Library: {@link Utilities},
*/
uriRefactoring: function (list, uriIndex) {
/*F..F..F.. javascript
you can't just create new array as newList=list.slice(), 
becouse during adding new item arra[0].length != arra[1].length, 
so at first you have to prepare "correct" array and then fill it.
One night without sleep is the price for following 6 lines of code,
like a first love :_(, no satisfaction at all
*/

    var newList = [];
    for (var i = 0; i < list.length; i++){
        newList[i] = [];
        for (var j = 0; j < list[i].length; j++){
            newList[i][j] = list[i][j];
    }}

    ListStreamingParameters.forEach(
        function(item){
//create regex for current item
            var currentReg = new RegExp(String(item+"=(\\d+)"));
            list.forEach(
                function(line, index){
                    var last = newList[index].length;
                    if (currentReg.exec(line[uriIndex])){
//add to the end of array value for current item
                        newList[index][last] = currentReg.exec(line[uriIndex])[1];
                    }
                    else {
//not applicable is streaming parameter is not present
                        newList[index][last] = "NA";
                    }
                }
            )   
        }
    );
    return newList
}


}
}
