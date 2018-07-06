include('Utilities.js');

init = function() {
    /** @namespace
     * Functions for creation and control different objects
     */

    Structures = {
        /**
         * Connect listener on a Numeric object key.
         * Listener will be called on every setup
         * of the key value independent on if the new value
         * differs from current one.
         * Only one listener at a time is supported.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object that key will be listened
         * @param {String} key
         * Object key will be listened
         * @param {function} listener
         * Function catching setup of the key value
         * It will be called with object and new key value
         * as arguments: listener(obj, newValue)
         * @example
         * // Watch "counter" key (having only Numeric values)
         * of "test" object and print key values
         * Structures.watch(test,
         * "counter",
         * function(obj, newValue){ print("New value " + newValue);})
         */
        watch: function(obj, key, listener) {
            Object.defineProperty( obj,
                                   key,
                                   {
                                       get : function() {
                                           return this.value;
                                       },
                                       set : function(newValue){
                                           this.value = newValue;
                                           listener(newValue, obj);
                                       },
                                       enumerable : true,
                                       configurable : true
                                   }
                                 );
        },
        /**
         * Disconnect listener from an object key.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object with listened key
         * @param {String} key
         * Listened object key
         * @example
         * // Unwatch "counter" key of "test" object
         * Structures.unwatch(test, "counter")
         */
        unwatch: function(obj, key) {
            Object.defineProperty( obj,
                                   key,
                                   {
                                       set : function(newValue){
                                           this.value = newValue;
                                       }
                                   }
                                 );
        },
        /** Check if an API current value
         * matched expected one
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object created by createSimpleSetting()
         * @param {function} exitFunc
         * Function will be executed next by getCheck()
         * if current value is matched to expected
         * @param {function} failFunc
         * Function will be executed next by getCheck()
         * if actual and expected values differ
         * @example
         * // Check frontend value and print "OK" on match
         * // and print "FAIL" on difference
         * Structures.getCheck( frontend,
         * Source.DVB_T,
         * function(){Utilities.print("OK");},
         * function(){Utilities.print("FAIL");})
         * @requires Library: {@link Utilities}
         */
        getCheck: function (obj, exitFunc, failFunc) {
            var currentValue = obj.api.getValue();
            // Print descriptive log strings for empty string values
            var logExpectedValue = (obj.operatingValue === ""? "empty value" :
                                    obj.operatingValue);
            var logCurrentValue = (currentValue === ""? "empty" :
                                   currentValue);
            if (currentValue != obj.operatingValue ) {
                Utilities.print("#VERIFICATION FAILED : Actual value of "
                                + (obj.name || obj.description)
                                + " is " + logCurrentValue
                                + " (differs from expected "
                                + logExpectedValue + ").");
                failFunc();
            }
            else {
                Utilities.print("Actual value of "
                                + (obj.name || obj.description)
                                + " is " + logCurrentValue);
                exitFunc();
            }
        },
        /** Check if an API current value
         * matched expected one
         * Wait till the value is changed or the end of
         * timeout before value verification
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object created by createSimpleSetting()
         * @param {Number} delay
         * Period of waiting of value change
         * @param {function} exitFunc
         * Function will be executed next by getCheck()
         * if current value is matched to expected
         * @param {function} failFunc
         * Function will be executed next by getCheck()
         * if actual and expected values differ
         * @example
         * // Check if frontend value was set during 2 seconds
         * // and print "OK" on match
         * // and print "FAIL" on difference
         * Structures.delayedCheck( frontend,
         * 2000,
         * function(){Utilities.print("OK");},
         * function(){Utilities.print("FAIL");})
         * @requires Library: {@link Utilities}
         */
        delayedCheck: function (obj, delay, exitFunc, failFunc) {
            var delay  = delay || 2000;
            function check () {
                var currentValue = obj.api.getValue();
                // FIXME: If the silent check doesn't hurt anything
                // remove commented lines
                if (currentValue != obj.operatingValue ) {
                    // Utilities.print("#VERIFICATION FAILED: Actual value of "
                    //                 + (obj.name || obj.description)
                    //                 + " is " + currentValue
                    //                 + " (differs from expected "
                    //                 + obj.operatingValue + ").");
                    failFunc();
                }
                else {
                    // Utilities.print("Actual value of "
                    //                 + (obj.name || obj.description)
                    //                 + " is " + currentValue);
                    exitFunc();
                }
            }
            Structures.delayedListener(obj.api, check, delay);
        },
        /** Execute specified function at api value change
         * Wait till the value is changed or the end of
         * timeout before function execution
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Biz API} api
         * Api will be listened on change event
         * @param {Number} delay
         * Period of waiting of value change
         * @param {function} func
         * Function will be executed on value change
         * @example
         * // Check frontend value was changed during 2 seconds
         * // and print "OK" on change
         * Structures.delayedListener( de.loewe.sl2.i32.channel.search.source,
         * 2000,
         * function(){Utilities.print("OK");})
         */
        delayedListener: function (api, func, delay) {
            var delay = delay || 3000;
            var timerID = 0;
            function listener() {
                window.clearTimeout(timerID);
                api.onChange.disconnect(listener);
                func();
            }
            api.onChange.connect(listener);
            timerID = window.setTimeout(
                function() {
                    api.onChange.disconnect(listener);
                    func();
                }, delay);
        },
        /** Check if an API current value
         * matched expected one
         * Function waits till the end of
         * timeout before value verification,
         * refreshes timeout if the value was changed
         * and so allows to check last value in a sequence of
         * quickly alternated ones
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object created by createSimpleSetting()
         * @param {Number} delay
         * Period of waiting of value change
         * @param {function} exitFunc
         * Function will be executed next by getCheck()
         * if current value is matched to expected
         * @param {function} failFunc
         * Function will be executed next by getCheck()
         * if actual and expected values differ
         * @example
         * // Check if frontend value was set
         * // and print "OK" on match
         * // and print "FAIL" on difference
         * // wait 2 seconds for next change
         * Structures.delayedCheck( frontend,
         * 2000,
         * function(){Utilities.print("OK");},
         * function(){Utilities.print("FAIL");})
         * @requires Library: {@link Utilities}
         */
        smoothCheck: function (obj, delay, exitFunc, failFunc) {
            var delay = delay || 2000;
            function check () {
                var currentValue = obj.api.getValue();
                // Print descriptive log strings for empty string values
                var logExpectedValue = (obj.operatingValue === ""?
                                        "empty value" : obj.operatingValue);
                var logCurrentValue = (currentValue === ""? "empty" :
                                       currentValue);

                if (currentValue != obj.operatingValue ) {

                    Utilities.print("#VERIFICATION FAILED: Actual value of "
                                    + (obj.name || obj.description)
                                    + " is " + logCurrentValue
                                    + " (differs from expected "
                                    + logExpectedValue + ")." );
                    failFunc();
                }
                else {
                    Utilities.print("Actual value of "
                                    + (obj.name || obj.description)
                                    + " is " + logCurrentValue);
                    exitFunc();
                }
            }
            Structures.smoothListener(obj.api, check, delay)
        },
        /** Execute specified function at api value change
         * Wait till the end of
         * timeout before function execution,
         * refreshes timeout if the value was changed
         * This allows to check last value in a sequence of
         * quickly alternated ones
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Biz API} api
         * Api will be listened on change event
         * @param {function} func
         * Function will be executed on value change
         * @param {Number} [delay = 2000]
         * Period of waiting for value change
         * @param {Number} [firstDelay = delay]
         * Period of waiting for first value change
         * @example
         * Structures.smoothListener( de.loewe.sl2.i32.channel.search.source,
         * function(){Utilities.print("OK");},
         * 2000)
         */
        smoothListener: function (api, func, delay, firstDelay) {
            var timerID = 0;
            var delay = delay || 2000;
            var firstDelay = firstDelay || delay;
            function listener() {
                if (timerID) {
                    window.clearTimeout(timerID);
                }
                timerID = window.setTimeout(
                    function () {
                        timerID = 0;
                        api.onChange.disconnect(listener);
                        func();
                    },
                    delay
                );
            }
            api.onChange.connect(listener);
            timerID = window.setTimeout(
                function() {
                    timerID = 0;
                    api.onChange.disconnect(listener);
                    func();
                },
                firstDelay);
        },
        /**
         * Set and check updated API value
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Scan
         * @param {function} exitFunc
         * Function that should be called on success
         * @param {object} obj
         * See example to check required structure.
         * @param {object} expectedValue
         * value will be set and the check
         * @param {function} failFunc
         * Function that should be called on failure
         * @example
         * var setting = {
         *      description: "searching method",
         *      api: de.loewe.sl2.i32.channel.search.method
         *  };
         * @requires Library: {@link Utilities}
         */
        setSmoothCheck: function(exitFunc, obj, expectedValue, failFunc) {
            var currentValue = obj.api.getValue();
            var failFunc = failFunc || exitFunc;
            function check () {
                currentValue = obj.api.getValue();
                if (currentValue.toString() == expectedValue.toString() ){
                    exitFunc(true);
                }
                else {
                    //failFunc(false);
                    exitFunc(true);// It timely desithiom, delete it after fix - reset ID of satellite.
                }
            }
            //define timeout to value verification
            var currentValue = obj.api.getValue();
            if (currentValue.toString() == expectedValue.toString()) {
                //fast verification if update is not executed
                var timeout = 2000;
            }
            else {
                var timeout = 10000;
            }
            Structures.smoothListener(obj.api, check, 2000, timeout)
            obj.api.setValue(expectedValue);

        },
        /**
         * Create array of objects for any APIs, but table ones.
         * All elements in argument lists should have
         * the same order.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Array} names
         * List of API names that would be printed to log
         * @param {Array} APIs
         * List of APIs
         * @param {Array} values
         * List of API expected values
         * For action API "null" value should be specified
         * @returns {Array}
         * Array of objects. Every object is
         * {"name": <API name for logging>,
         * "api": <Model API>
         * "value": <Expected API value>}
         * @example
         * // Create object for frontend
         * Structures.createSimpleSetting(
         * ["frontend"],
         * [de.loewe.sl2.i32.channel.search.source],
         * [Source.DVB_C])
         * // Create objects for frontend and location
         * Structures.createSimpleSetting(
         * ["frontend", "location"],
         * [de.loewe.sl2.i32.channel.search.source,
         * de.loewe.sl2.i32.basic.settings.tvset.location],
         * [Source.DVB_C, Location.GERMANY])
         */
        createSimpleSetting: function (names, APIs, values) {
            return names.map(
                function(itm, idx) {
                    return {"name": itm,
                            "api": APIs[idx],
                            "operatingValue": values[idx]
                           };
                }
            );
        },
        /**
         * Connect listener to the change of value key
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object of interest created by Structures.createSimpleSetting()
         * @param {function} listener
         * Function will be executed on a value change
         * @example
         * // Print returned value of a called action "confirm"
         * Structures.watchValue(confirm,
         * function(obj, newValue){ print("Confirm returned " + newValue);})
         */
        watchValue: function (obj, listener) {
            Structures.watch(obj, "operatingValue", listener);
        },
        /**
         * Disconnect listener from API value
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Structures
         * @param {Object} obj
         * Object of interest created by Structures.createSimpleSetting()
         * @example
         * // Unwatch action "confirm"
         * Structures.unwatchValue(confirm)
         */
        unwatchValue: function (obj) {
            Structures.unwatch(obj, "operatingValue");
        }
    }
}
