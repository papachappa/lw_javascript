include('Utilities.js');
include('ServiceList.js');
include('Compare.js');

init = function() {
    /** @namespace
     * EPGquery
     */
    EPGquery = {
        /**
         * Get EPG data for specified filters and specified format
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof EPGquery
         * @param {function} exitFunc
         * Function will be called on success with EPG data as parameter
         * @param {array} services
         * Array of triplets describing services to be checked. Each triplet
         * is a vector [channel number, service media type, service list name]
         *
         * @param {object} [filters = {}]
         * Dictionary describing selection fields values. Its keys are fields
         * numbers in the EPG table, values are exact values of corresponding
         * fields that should be satisfied during selection from EPG tables
         *
         * @param {array} [outputFields = []]
         * Vector of fields should be present and verified in result.
         * SID, TSID, ONID and EID are mandatory fields and would be verified
         * always. Other fields can be specified via this parameter.
         *
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with EPG data as parameter
         *
         * @example
         * Structure of services
         * var services = [
         *      [1, MediaType.TV, "DVB-S"],
         *      [8, MediaType.TV, "DVB-S"],
         *      [3, MediaType.RADIO, "DVB-S"]
         * ];
         *
         * Structure of filters
         * var filters = {
         *      EPG.START_TIME: 1422543000,
         *      EPG.END_TIME: 1422544800,
         *      EPG.TITLE: "Benedict"
         * };
         *
         * Structure of optional fields
         * var optionalFields = [EPG.SID, EPG.TSID, EPG.ONID, EPG.TITLE,
         * EPG.RATING];
         *
         * @requires Library: {@link Utilities}, {@link ServiceList}
         */
        getEPG: function(exitFunc,
                         services,
                         allFilters,
                         optionalFields,
                         failFunc) {
            var failFunc = failFunc || exitFunc;
            var result = [];
            var outputFields = optionalFields;
            var times = {};
            var filters = {};
            for (key in allFilters) {
                if (key == EPG.START_TIME || key == EPG.END_TIME) {
                   times[key] = allFilters[key]
                }
                else {
                    filters[key] = allFilters[key]
                }
            }
            // All fields including ones necessary for post-filtering
            var fields = outputFields.concat(
                Object.keys(filters).map(
                    function(item) { return Number(item); }));
            // Unique
            fields = fields.filter(function(item, idx) {
                return fields.indexOf(item) == idx});

            function createRequest(SID, TSID, ONID) {
                function makeSelection(filters) {
                    function makeCond(field, val) {
                        // Exact match
                        var conditionType = 1;
                        switch(Number(field)) {
                            // Start time (not less)
                        case EPG.START_TIME:
                            conditionType = 6;
                        break;
                            // End time (less, but accidentally it returns
                            // not more in this case)
                        case EPG.END_TIME:
                            conditionType = 3;
                            break;
                        }
                        return {"field": field, "conditionType": conditionType,
                                "condition": val};
                    }
                    var v_selections = [];
                    for (key in filters) {
                        v_selections.push(makeCond(key, filters[key]));
                    }
                    return v_selections;
                }
                return {
                    "selections": makeSelection(
                        { 2000: SID,
                          2001: TSID,
                          2002: ONID }
                    ).concat(makeSelection(times)),
                    "fields": fields,
                    /*Sorting by event name is used because any other sorting
                      leads to duplication of some events data
                    */
                    "orders": [{"field": 2007, "direction": 1 }]
                };
            }

            function  manager(args) {
                var steps = {
                    "GetServiceListUID" : function(input) {
                        var serviceNumber = input[0];
                        if (serviceNumber < services.length) {
                            ServiceList.getServicelistUID(
                                function(serviceListUID) {
                                    manager(["GetServiceInfo",
                                             serviceListUID,
                                             serviceNumber]);
                                },
                                services[serviceNumber][2]);
                        }
                        else {
                            Utilities.print("EPG information is collected.");
                            manager(["EndTest", true]);
                        }
                    },
                    "GetServiceInfo" : function(input) {
                        var serviceListUID = input[0];
                        var serviceNumber = input[1];
                        if (Object.keys(serviceListUID).length != 1) {
                            Utilities.print(
                                "#ERROR: "
                                    + Object.keys(serviceListUID).length
                                    + " service lists '"
                                    + services[serviceNumber][2]
                                    + "' are found.");
                            Utilities.print("Verification of service #"
                                            + services[serviceNumber][0]
                                            + "' in '"
                                            + services[serviceNumber][2]
                                            + "' service list is failed.");
                            manager(["EndTest"]);
                        }
                        else {
                            var query  =  {
                                selections: [
                                    { field: 1,
                                      conditionType: 1,
                                      condition: String(serviceListUID[0]) },
                                    { field: 6,
                                      conditionType: 1,
                                      condition: services[serviceNumber][0]
                                    },
                                    { field: 21,
                                      conditionType: 1,
                                      condition: services[serviceNumber][1]
                                    }
                                ],
                                // SID, TSID, ONID, attributes mask
                                fields: [8, 9, 10, 3],
                            }
                            var api = de.loewe.sl2.table.servicelist.list;

                            Utilities.print("Getting service info...");
                            Utilities.getTableValues(
                                function(serviceInfo) {
                                    manager(["RequestEPG", serviceInfo,
                                             serviceNumber]);
                                }, api, query);
                        }
                    },
                    "RequestEPG" : function(input) {
                        var serviceInfo = input[0];
                        var serviceNumber = input[1];
                        if (serviceInfo.length != 1) {
                            Utilities.print(
                                "#ERROR: Triplet for service #'"
                                    + services[serviceNumber][0] + "' in '"
                                    + services[serviceNumber][2]
                                    + "' service list is not defined.\n"
                                    + "Verification of the service is failed."
                            );
                            manager(["EndTest"]);
                        }
                        else {
                            // If the third bit in attribute mask is not set,
                            // then EPG info capturing is turned off.
                            if (!(serviceInfo[0][3] & 1<< 3)) {
                                Utilities.print(
                                    "WARN: EPG capture is disabled for "
                                        + "service #'"
                                        + services[serviceNumber][0] + "' in '"
                                        + services[serviceNumber][2]
                                        + "' service list.");
                            }

                            var query = createRequest(serviceInfo[0][0],
                                                      serviceInfo[0][1],
                                                      serviceInfo[0][2]);
                            var api = de.loewe.sl2.epg;

                            Utilities.print("Getting EPG info...");
                            Utilities.getTableValues(
                                function(EPGinfo) {
                                    manager(["ParseEPG", EPGinfo, serviceNumber]);
                                },
                                api,
                                query
                            );
                        }
                    },
                    "ParseEPG" : function(input) {
                        var EPGinfo = input[0];
                        var serviceNumber = input[1];
                        if (EPGinfo.length == 0) {
                            Utilities.print(
                                "WARN: EPG info for service #'"
                                    + services[serviceNumber][0] + "' in '"
                                    + services[serviceNumber][2]
                                    + "' service list is not found.");
                        }
                        else {
                            // Post filtering
                            for (key in filters) {
                                EPGinfo = EPGinfo.filter(
                                    function(item) {
                                        return item[
                                            fields.indexOf(Number(key))]
                                            == filters[key];
                                    });
                            }
                            // Fields reduction
                            EPGinfo = EPGinfo.map(function(arr) {
                                return outputFields.map(function(item) {
                                    return arr[fields.indexOf(item)];
                                });
                            });
                            result = result.concat(EPGinfo);
                        }
                        var serviceNextNumber = serviceNumber + 1;
                        manager(["GetServiceListUID", serviceNextNumber]);
                    },
                    "EndTest" : function(testResult) {
                        if (testResult[0]) {
                            exitFunc(result, true);
                        }
                        else {
                            failFunc([], false);
                        }
                    }
                }
                steps[args[0]](args.slice(1));
            }
            manager(["GetServiceListUID", 0]);
        },
        /**
         * Get list of services having EPG capture enabled
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof EPGquery
         * @param {function} exitFunc
         * Function will be called on success with retrieved list of services
         * and true as parameters: exitFunc([], true)
         *
         * @param {string} serviceList
         * Name of the service List under test
         *
         * @param {array} [fields = [SL_Fields.SID, SL_Fields.TSID,
         * SL_Fields.ONID]]
         * Vector of fields should be present in result.
         * SID, TSID and ONID will be returned by default.
         *
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with empty list and false as
         * parameter: failFunc([], false)
         *
         * @requires Library: {@link Utilities}, {@link ServiceList}
         */
        getServicesWithEPG: function(exitFunc,
                                     serviceList,
                                     fields,
                                     failFunc) {
            var failFunc = failFunc || exitFunc;
            var result = [];
            // If fields are not specified
            if (!(Array.isArray(fields) || fields.length == 0))
            {
                fields = [SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID];
            }
            function  manager(args) {
                var steps = {
                    "GetServiceListUID" : function() {
                        if (serviceList == "OVERALL") {
                            manager(["GetServiceInfo", [""]]);
                        }
                        else {
                            ServiceList.getServicelistUID(
                                function(serviceListUID) {
                                    manager(["GetServiceInfo",
                                             serviceListUID]);
                                },
                                serviceList);
                        }
                    },
                    "GetServiceInfo" : function(serviceListUID) {
                        var serviceListUID = serviceListUID[0];
                        if (serviceListUID.length != 1) {
                            Utilities.print(
                                "#ERROR: " + serviceListUID.length
                                    + " service lists '" + serviceList
                                    + "' are found.");
                            manager(["EndTest"]);
                        }
                        else {
                            var query  =  {
                                selections: [
                                    { field: 1,
                                      conditionType: 1,
                                      condition: String(serviceListUID[0]) }
                                ],
                                // fields + attributes mask
                                fields: fields.concat([3])
                            }
                            var api = de.loewe.sl2.table.servicelist.list;

                            Utilities.print("Getting services...");
                            Utilities.getTableValues(
                                function(serviceInfo) {
                                    manager(["FilterServices", serviceInfo]);
                                }, api, query);
                        }
                    },
                    "FilterServices" : function(input) {
                        var serviceInfo = input[0];
                        var result = serviceInfo.filter(
                            function(item) {
                                // If the third bit in attribute mask is set,
                                // then EIT capture is turned on.
                                return item[item.length - 1] & 1<< 3;
                            }
                        ).map(function(item) {
                            return item.slice(0, item.length - 1);});
                        manager(["EndTest", result]);
                    },
                    "EndTest" : function(result) {
                        var result = result[0];
                        if (result != undefined) {
                            exitFunc(result, true);
                        }
                        else {
                            failFunc([], false);
                        }
                    }
                }
                steps[args[0]](args.slice(1));
            }
            manager(["GetServiceListUID"]);
        },
        /**
         * Get list of services having EPG capture enabled and compare them
         * with expected list
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof EPGquery
         *
         * @param {function} exitFunc
         * Function will be called on success with retrieved list of services
         * and true as parameters: exitFunc([], true)
         *
         * @param {string} serviceList
         * Name of the service List under test
         *
         * @param {array} [fields = [SL_Fields.SID, SL_Fields.TSID,
         * SL_Fields.ONID]]
         * Vector of fields should be present in result.
         * SID, TSID and ONID will be returned by default.
         *
         * @param {array} [expectedResult = []]
         * Array containing services to be checked. Its format (fields and
         * their order) should exactly match the "fields" parameter
         *
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with empty list and false as
         * parameter: failFunc([], false)
         *
         * @requires Library: {@link Utilities}, {@link Compare}
         */
        checkServicesWithEPG: function(exitFunc,
                                       serviceList,
                                       fields,
                                       expectedResult,
                                       failFunc) {
            var failFunc = failFunc || exitFunc;
            var result = [];
            function  manager(args) {
                var steps = {
                    "GetServices" : function() {
                        Utilities.print("Retrieving services...");
                        EPGquery.getServicesWithEPG(
                            function(services) {
                                    manager(["CheckResult", services]);},
                            serviceList,
                            fields,
                            function() { manager(["EndTest"]); });
                    },
                    "CheckResult" : function(services) {
                        var result = services[0];
                        Utilities.print("Checking services...");
                        var SID_field = fields.indexOf(SL_Fields.SID);
                        var TSID_field = fields.indexOf(SL_Fields.TSID);
                        var ONID_field = fields.indexOf(SL_Fields.ONID);
                        function createIndex(line) {
                            // Hash is "SID-TSID-ONID"
                            return [line[SID_field], line[TSID_field],
                                    line[ONID_field]].join("-");
                        }
                        // Headers for result pretty printing
                        var logLabels = fields.map(function(item) {
                            return Utilities.getKey(SL_Fields, item);
                        });

                        // Make dictionary from expected,
                        // query results and hash
                        var resultDict = Compare.makeDictionary(
                            expectedResult, result, createIndex);
                        manager(["EndTest", Compare.compareDictionaries(
                            resultDict, logLabels)]);
                    },
                    "EndTest" : function(result) {
                        var result = result[0];
                        if (result) {
                            exitFunc(result);
                        }
                        else {
                            failFunc(result);
                        }
                    }
                }
                steps[args[0]](args.slice(1));
            }
            // If fields are not specified
            if (Array.isArray(fields) && fields.length != 0) {
                // Check that fields contain mandatory DVB triplet
                if (! [SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID].every(
                    function(item) { return fields.indexOf(item) != -1; })) {
                    Utilities.print("#ERROR: List of fields should contain DVB"
                                    + " triplet as it used for result "
                                    + "comparison.");
                    failFunc(false);
                }
            }
            else {
                fields = [SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID];
                manager(["GetServices"]);
            }
        }
    }
}
