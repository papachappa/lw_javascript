include('Utilities.js');
include('Compare.js');
include('Enumerators.js');
include('PressButton.js')

init = function() {
    
    BEPGquery = {

        getBEPG: function execute(services, expectedResult, exitfunc) { 
                var failed = []
                var expectedResult = expectedResult
                var exitfunc = exitfunc
                var queryDef  =  []
                var result = []
                var day_count = 0
                var query_array_index = 0

                function prettyPrint(arr) {
                    return arr.reduce(
                    function(accum, item) {
                        return accum + '"' + item + '", '
                    }, "[ "
                    ).slice(0, -2) + " ],";
                }

                function wait(ms){
                          var start = new Date().getTime();
                          var end = start;
                          while(end < start + ms) {
                            end = new Date().getTime();
                         }
                       }
                
                function PressBut(keyID, sec){
                    PressButton.singlePress(keyID)  
                    wait(sec)
                }

                function  manager(args) {

                 var steps = {

                    "FormingBEPG" : function(args) {
                         args[0][0].forEach(function(elem) {
                            s = [
                                {
                                selections: [ { field: 0, conditionType: 1, condition: "-7" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-6" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-5" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-4" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-3" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-2" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-1" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                },
                                {
                                    selections: [ { field: 0, conditionType: 1, condition: "-0" }, { field: 1, conditionType: 1, condition: String(elem[0]) },{ field: 2, conditionType: 1, condition: String(elem[1]) },{ field: 3, conditionType: 1, condition: String(elem[2]) } ],
                                    fields:     [ 0, 1, 2, 3, 4, 5, 6 ]
                                //    orders:     [ { field: 0, direction: 1 } ]
                                }
                                ]
                                queryDef.push(s)

                         });
                        manager(["OpenBEPGMenu", day_count, query_array_index]); 
                    },

                    
                    "RequestBEPG" : function(args) {
                        var fvpScheduleListTable = de.loewe.sl2.table.fvp.schedulelist;
                        var query_array = queryDef
                        var rowsNumber = 0;
                        var currentPhase = "Read first rows second time";
                        var currentIndex = 0;
                            
                        if ((day_count > 7) && (query_array_index == query_array.length - 1)){
                            manager(["Compare_results"])
                        } 
                        
                        else if (day_count > 7) {
                            query_array_index += 1
                            day_count = 0
                            manager(["RequestBEPG", day_count, query_array_index]); 
                        }
                        
                        else {

                        query = fvpScheduleListTable.createQuery(query_array[query_array_index][day_count]);
                        query.onQueryReady.connect(this,onQueryReady);
                        query.execute();

                        function rowSeeker(currentIndex) {
                            Utilities.print("Cur index" + currentIndex)
                            query.seekToRow(currentIndex, 0);
                            query.readNextRows(1);
                        }

                        function onQueryReady(count){
                            // Utilities.print("Please wait...");
                            // Utilities.print("count is " + count);
                            query.onQueryReady.disconnect(this, onQueryReady);
                            if (count == 0) {
                                day_count = day_count + 1
                                manager(["RequestBEPG", day_count]); 

                            }
                            else {
                                query.onRows.connect(this, onRows);
                                query.seekToRow(0, 0);
                                if (count > 10) {
                                    query.readNextRows(10);
                                }
                                else {
                                    query.readNextRows(count);
                                }
                                rowsNumber = count;
                            }
                        }
                        function onRows(id, rows){
                            // Utilities.print("Rows " + rows)
                            // Utilities.print("currentPhase " + currentPhase)
                            if (currentPhase == "Read first rows second time") {
                                currentPhase = "Add rows to the result array";
                                query.seekToRow(0, 0);
                                if (rowsNumber > 10) {
                                    query.readNextRows(10);
                                }
                                else {
                                    query.readNextRows(rowsNumber);
                                }
                            }
                            else if (currentPhase == "Add rows to the result array") {
                                result = result.concat(rows);
                                if (rowsNumber > 10) {
                                    currentPhase = "Read rows second time";
                                    currentIndex++;
                                    query.seekToRow((10*currentIndex), 0);
                                    query.readNextRows(10);
                                }
                                else {
                                    currentPhase = "Check results";
                                    query.seekToRow(0, 0);
                                    query.readNextRows(1);
                                }
                            }
                            else if (currentPhase == "Read rows second time") {
                                rowsNumber = rowsNumber - 10;
                                currentPhase = "Add rows to the result array";
                                if (rowsNumber > 10) {
                                    query.seekToRow((10*currentIndex), 0);
                                    query.readNextRows(10);
                                }
                                else {
                                    query.seekToRow((10*currentIndex), 0);
                                    query.readNextRows(rowsNumber);
                                }
                            }
                            else if (currentPhase == "Check results") {
                                query.onRows.disconnect(this, onRows);
                                // Utilities.print("End of BEPG collection: ");
                                day_count = day_count + 1
                                manager(["RequestBEPG", day_count]); 
                            }
                        }
                        }
                    },

                    "OpenBEPGMenu" : function() {
                    var epgRequsted = de.loewe.sl2.i32.epg.schedule.requested;          
                    // Get to EPG
                    Utilities.print("Need to get to BEPG via UI in order to get result from BEPG")
                    PressBut(Key.END, 2000);
                    PressBut(Key.END, 2000);
                    PressBut(Key.GLOBAL_MENU, 2000);
                    PressBut(Key.END, 2000);
                    PressBut(Key.EPG, 2000);
                    if (epgRequsted.getValue() == 1) {
                        manager(["BEPGNavigation"]);
                    }
                    else {
                        Utilities.print("WARN: EPG menu was not opened.");
                        Utilities.print("WARN: Events will be checked w/o navigation through BEPG menu.");
                        manager(["Compare_results"]);
                    }

                    },

                    "BEPGNavigation" : function() {
                        // Need to get to BEPG via UI
                        PressBut(Key.CONTEXT_MENU, 2000);
                        PressBut(Key.UP, 2000);
                        PressBut(Key.UP, 2000);
                        PressBut(Key.UP, 2000);
                        PressBut(Key.UP, 2000);
                        PressBut(Key.OK, 7000);
                        PressBut(Key.END, 2000);
                        PressBut(Key.END, 2000);
                        PressBut(Key.END, 2000);
                        manager(["RequestBEPG"]);
                    },

                    "Compare_results" : function() {
                        Utilities.print("Compare services...");
                        
                        // WORKING PRETTY PRINT OF RESULT ARRAY 
                        // result.forEach(function(item) {
                        //     Utilities.print(
                        //         item.reduce(function(accum, itm){
                        //         return accum + '"' + String(itm) + '", '
                        //         }, "[ ").slice(0, -2) + " ],"
                        //                    );
                        // }); 
                        
                        var expNumServs = Utilities.numberOfElements(
                            expectedResult
                        );
                        var exisNumServs = Utilities.numberOfElements(
                            result
                        );
                        Utilities.print('Expected number of services ' + expNumServs)
                        Utilities.print('Existed number of services on TV ' + exisNumServs)
                        if (expNumServs != exisNumServs) {
                            Utilities.print("\n#VERIFICATION FAILED: Number of services in "
                                            + "result array is " + exisNumServs
                                            + " instead of expected " + expNumServs
                                            + ".");
                            failed.push("fail")
                            manager(["EndTest"]);
                        }
                        
                        else {
                            for(i=0; i < expectedResult.length; i++){
                                for(j=0; j < expectedResult[i].length; j++){
                                
                                    if (expectedResult[i][j] == "DNC") {
                                    continue
                                    }
                                
                                    else if (expectedResult[i][j] != result[i][j]) {
                                    Utilities.print("\nThere is some changed row in result array")
                                    Utilities.print(prettyPrint(result[i]));
                                    
                                    Utilities.print("\nCorresponding to expected array")
                                    Utilities.print(prettyPrint(expectedResult[i]));
                                    

                                    failed.push("fail")
                                    }

                                }
                            }
                        manager(["EndTest"]);
                        }

                        // Anya's version of check
                        // var expNumServs = Utilities.numberOfElements(
                        //     expectedResult
                        // );
                        // var exisNumServs = Utilities.numberOfElements(
                        //     result
                        // );
                        // Utilities.print('expNumServs ' + expNumServs)
                        // Utilities.print('exisNumServs ' + exisNumServs)
                        // if (expNumServs != exisNumServs) {
                        //     Utilities.print("INFO: Number of services in "
                        //                     + "result array is " + exisNumServs
                        //                     + " instead of expected " + expNumServs
                        //                     + ".");
                        // }

                        // function hash (arrayRow) {
                        //     // Do not know if we need arrayRow[6] - timestamp field
                        //     return [arrayRow[1], arrayRow[2], arrayRow[3], arrayRow[6]].join("-");
                        // };
                            

                        // var resultDict = Compare.makeDictionary(
                        //                     expectedResult,
                        //                     result,
                        //                     hash
                        //                  );
                        // var logLabels = ["\tDAY", "SID", "TSID",
                        //                  "ONID", "TITLE", "PROGRAMID",
                        //                  "PUBLISHED_STARTTIME"];

                        // if (Compare.compareDictionaries(resultDict,
                        //                                 logLabels,
                        //                                 "INFO")) {
                        //     Utilities.print("#VERIFICATION PASSED: "
                        //                     + "ServiceList is equal to expected.");
                        // }
                        // else {
                        //     Utilities.print("#VERIFICATION FAILED: "
                        //                     + "Current ServiceList is not equal to expected.");
                        // }
                        // manager(["EndTest"]);


                    },
                    "EndTest" : function() {
                        if(typeof failed != "undefined" && failed != null && failed.length > 0){
                            Utilities.print("\n#VERIFICATION FAILED: "
                                            + "Current ServiceList is not equal to expected.");
                        }
                        else {
                            Utilities.print("\n#VERIFICATION PASSED: "
                                            + "ServiceList is equal to expected.");
                        }

                        Utilities.print("\nActual list:");
                        result.forEach(
                            function(item) {
                                Utilities.print(prettyPrint(item));
                            }
                        )
                        Utilities.print("\nExpected list:");
                        expectedResult.forEach(
                            function(item) {
                                Utilities.print(prettyPrint(item));
                            }
                        )
                        exitfunc()
                    }
                 }
                steps[args[0]](args.slice(1));
            }
            manager(["FormingBEPG", services, expectedResult, exitfunc])
           }
         }
     }
 
