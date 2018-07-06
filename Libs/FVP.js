include('Utilities.js');

init = function() {
        

    FVP = {

        GetRequest: function (expected_array, tvapi, queryDef, exitfunc, service_num, request, result_array) { 
            var result_array = result_array || []
            var err_count = 0   
            
            if (service_num == 0) {
              var service_num = 0
            }
            else {
              var service_num = service_num || undefined
            }
            
            var request = request || undefined
            
            function wait(ms){
              var start = new Date().getTime();
              var end = start;
              while(end < start + ms) {
                end = new Date().getTime();
             }
           }
           // Use in case of necessity
           function check_multidimensionality(array){
                var is_multi = false
                for(var i=0; i < array.length; i++){
                    if (typeof array[i] == "object") {
                        is_multi = true 
                    }
                }
                return is_multi
            }

            function  manager(args) {
            var steps = {                     
            
                "APIRequest": function (args) {
                      if (request == "set_get") {
                        manager(["SetGetValue", args]);
                      }
                      else if (request == "compare") {
                        manager(["Arraycheck", expected_array]);
                      }
                      else {
                      query = tvapi.createQuery( queryDef );
                      query.onQueryReady.connect( this, onQueryReady );
                      query.execute();

                      function onQueryReady(count)
                      {
                          if (count <= 0) {
                            manager(["2DArraycheck", expected_array]);
                          }
                          query.onQueryReady.disconnect(this, onQueryReady);
                          query.onRows.connect( this, onRows );
                          query.readAllRows();
                      }
                      function onRows( id, rows )
                      {
                          result_array = result_array.concat(rows)
                          query.onRows.disconnect(this, onRows);
                          manager(["2DArraycheck", expected_array]);
                      }
                    }
                    
                },

                "2DArraycheck": function(expected_array) {
                    try {
                    function flatten_array(array) {
                        var flatten = array.reduce(function(a, b) {
                          return a.concat(b);
                         });
                        return flatten
                    }

                    function identitycheck(flatten_expected_array){

                    if (flatten_expected_array.length == 0 
                        && result_array.length == 0 ) {
                      return true
                    }

                    else if (result_array.length == 0)  {
                      return false      
                    }

                    else if (flatten_expected_array.length == 0
                             && result_array.length != 0)  {
                      return false      
                    }

                    var fail = 0
                    for(var i=0; i < flatten_expected_array.length; i++){
                            if (typeof result_array[i] == 'undefined') {
                              Utilities.print("\nResult array has fewer elements than expected.")
                              Utilities.print("Check expected result settings")
                              return false
                            }
                        for(var j=0; j < flatten_expected_array[i].length; j++){
                            
                            if (flatten_expected_array[i][j] == "DNC") {
                                continue
                            }
                            else if (flatten_expected_array[i][j] != result_array[i][j]) {
                                Utilities.print("\nThere is some changed row in result array")
                                Utilities.print("\"" + result_array[i][j] + "\"");
                                Utilities.print("\nCorresponding to row in expected array")
                                Utilities.print("\"" + flatten_expected_array[i][j] + "\"");
                                fail += 1
                                // If you want to see what exactly chars are different in utf8 code, uncomment this
                                Utilities.compareString(flatten_expected_array[i][j], result_array[i][j])
                            }

                        }
                    }
                    if (fail == 0) {
                        return true
                    }
                    else {
                        return false
                    }
                    }

                    function print_actual_array(){
                        var s = ""
                        Utilities.print("\nActual list: ")
                          s += "[\n";
                          for (var i = 0; i < result_array.length; i++ ){
                              s += "[" + " ";
                              for (var j = 0; j < result_array[i].length; j++ ){ 
                                  if (result_array[i][j].search(/ERROR/i) == 0) {
                                  err_count += 1
                                  }
                                s += "\"" + result_array[i][j] + "\", ";
                              }
                              if (i != result_array.length - 1) {
                                s += "],\n";
                              }
                              else {
                               s += "]\n"; 
                              }
                          }
                          s += "]";
                          Utilities.print(s)
                    }

                    function print_expected_array(){
                        var s = ""                        
                        Utilities.print("\nExpected list: ")
                        s += "[\n";
                          for (var i = 0; i < expected_array.length; i++ ){
                              for (var j = 0; j < expected_array[i].length; j++ ){ 
                                s += "[" + " ";
                                for (var k = 0; k < expected_array[i][j].length; k++ ){ 
                                  s += "\"" + expected_array[i][j][k] + "\", ";   
                                }
                              if (j != expected_array[i].length - 1) {
                                s += "],\n";
                              }
                              else {
                               s += "]\n"; 
                              }
                            }
                          }
                        s += "]";
                        Utilities.print(s);
                    }

                    flatten_expected_array = flatten_array(expected_array)
                    id_check = identitycheck(flatten_expected_array)
                    print_actual_array()
                    print_expected_array()
                    manager(["Result", id_check]);
                    }
                    catch(e){
                      throw e
                    }
                },

                "Arraycheck": function(expected_array) {
                  try {
                    function flatten_expected_array(expected_array) {
                        var flatten = [].concat.apply([], expected_array);
                        return flatten
                    }

                    function identitycheck(flatten){

                    if (flatten.length == 0 
                        && result_array.length == 0 ) {
                      return true
                    }

                    else if (result_array.length == 0)  {
                      return false      
                    }

                    else if (flatten.length == 0 
                             && result_array.length != 0)  {
                      return false      
                    }


                    var fail = 0
                    for(var i=0; i < flatten.length; i++){
                      if (typeof result_array[i] == 'undefined') {
                      Utilities.print("\nResult array has fewer elements than expected.")
                      Utilities.print("Check expected result settings")
                      return false
                      }

                        if (flatten[i] == "DNC") {
                            continue
                        }
                        else if (flatten[i] != result_array[i]) {
                            Utilities.print("\nThere is some changed row in result array")
                            Utilities.print("\"" + result_array[i] + "\"");
                            Utilities.print("\nCorresponding to row in expected array")
                            Utilities.print("\"" + flatten[i] + "\"");
                            fail += 1
                            // If you want to see what exactly chars are different in utf8 code, uncomment this
                            Utilities.compareString(flatten[i].join(), result_array[i])
                        }
                    }
                    if (fail == 0) {
                        return true
                    }
                    else {
                        return false
                    }
                    }
                    function print_actual_array(){
                        var s = ""
                        Utilities.print("\nActual list: ")
                        s += "[\n";
                        for (var i = 0; i < result_array.length; i++ ){
                                  if (result_array[i].search(/ERROR/i) == 0) {
                                  err_count += 1
                                  }
                                 s += "[\"" + result_array[i] + "\"],\n";
                        }
                        s += "]";
                        Utilities.print(s)
                    }

                    function print_expected_array(){
                        var s = ""
                        Utilities.print("\nExpected list: ")
                        s += "[\n";
                        for (var i = 0; i < expected_array.length; i++ ){
                              if (expected_array.length != 1) {
                              }
                              for (var j = 0; j < expected_array[i].length; j++ ){
                                s += "[\"" + expected_array[i][j] + "\"],\n";
                              }
                        }
                        s += "]";
                        Utilities.print(s);
                    }

                    flatten = flatten_expected_array(expected_array)
                    id_check = identitycheck(flatten)
                    print_actual_array()
                    print_expected_array()
                    manager(["Result", id_check]);
                  } catch(e) {
                    throw e
                  }
                },

                "Result": function(args){
                    if (err_count != 0) {
                      Utilities.print("\n#VERIFICATION FAILED: "
                                         + "Current List item contains ERROR string.");
                    }
                    else if (id_check == false || service_num != result_array.length) {
                      Utilities.print("\n#VERIFICATION FAILED: "
                                         + "Current List contents is not the same as expected. Or service number not equal to expected");
                    }
                    else {
                     Utilities.print("\n#VERIFICATION PASSED: "
                                         + "Current List contents is the same as expected. "); 
                    }
                    Utilities.printTestResult();
                    exitfunc()
                },

                "SetGetValue": function(args){
                    try {
                    if (typeof(queryDef) == "undefined") {
                        for (var i=0; i<tvapi.length;i++) {
                            if (typeof tvapi[i] == 'undefined') {
                              Utilities.print("Probably you set incorrect api name. Please, check your api name")
                              return
                            } 
                            else if (i != tvapi.length-1) {
                                result_string = tvapi[i].getValue() + "$"
                            }
                            else {
                                result_string = tvapi[i].getValue()
                            }
                            result_array.push(result_string)   
                        }
                        exitfunc(result_array)

                    }
                    else {                      
                      suggestion_req = tvapi
                      suggestion_res = queryDef
                      suggestion_req.setValue(cond);
                      wait(2000)
                      result_array = suggestion_res.getValue();
                      manager(["Arraycheck", expected_array]);
                    }
                } catch (e) {
                  throw e
                }
                }
            }

            steps[args[0]](args.slice(1));
            }
            try {
              manager(["APIRequest", expected_array, tvapi, queryDef, exitfunc, service_num, request])
            }
            catch(e) {
              throw new Error("While executing a lib error occurred " + e.name + ":" + e.message)
                id_check = false
                manager(["Result", id_check]);
            }
           }
         }
     }
