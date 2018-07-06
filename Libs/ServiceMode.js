include('Utilities.js');
include('Structures.js');

init = function() {
    /** @namespace
     * ServiceMode
     */
    ServiceMode = {
        /**
         * Return the current value of a chassis option
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ServiceMode
         * @param {String} optName
         * Name of the option under test
         */
        getChassisOption: function(optName) {
            var optNames = de.loewe.sl2.vstr.servicemode
                .option.names.getValue();
            var optValues = de.loewe.sl2.vstr.servicemode
                .option.values.getValue();
            var optID = optNames.indexOf(optName);
            if (optID == -1) {
                Utilities.print("WARN: The '" + optName + "' option is not "
                                + "found.");
                return false;
            }
            else {
                return optValues[optID];
            }
        },
        /**
         * Check the current value of a chassis option
         * and return true if the option has an expected value
         * and false otherwise
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ServiceMode
         * @param {String} optName
         * Name of the option under test
         * @param {Integer} expectedValue
         * Expected value of the option under test
         */
        checkChassisOption: function(optName, expectedValue) {
            var optNames = de.loewe.sl2.vstr.servicemode
                .option.names.getValue();
            var optValues = de.loewe.sl2.vstr.servicemode
                .option.values.getValue();
            var optID = optNames.indexOf(optName);
            if (optID == -1) {
                Utilities.print("WARN: The '" + optName + "' option is not "
                                + "found.");
                return false;
            }

            return (optValues[optID] == expectedValue);
        },
        /**
         * Set a new value of a chassis option
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ServiceMode
         * @param {function} exitFunc
         * Function will be executed on success
         * with true as its argument
         * @param {String} optName
         * Name of the option under test
         * @param {Integer} newValue
         * Expected value of the option under test
         * @param {function} [failFunc=exitFunc]
         * Function will be executed on failure with false as its argument
         */
        setChassisOption: function(exitFunc, optName, newValue, failFunc) {
            var failFunc = failFunc || exitFunc;
            var optNames = de.loewe.sl2.vstr.servicemode
                .option.names.getValue();
            var optValues = de.loewe.sl2.vstr.servicemode
                .option.values;
            var optID = optNames.indexOf(optName);
            if (optID == -1) {
                Utilities.print("WARN: The '" + optName + "' option is not "
                                + "found.");
                failFunc(false);
            }
            else if (optValues.getValue()[optID] == newValue) {
                Utilities.print("The '" + optName + "' already has the "
                                + "expected value '" + newValue + "'.");
                exitFunc(true);
            }
            else {
                Utilities.print("Set '" + optName + "' to '" + newValue
                                + "'.");
                var setOption = de.loewe.sl2.action.servicemode.option.set;
                var check = function () {
                    if (String(optValues.getValue()[optID])
                        == String(newValue)) {
                        exitFunc(true);
                    }
                    else {
                        failFunc(false);
                    }
                }

                Structures.smoothListener(optValues, check, 2000, 5000);
                setOption.call([optName, newValue]);
            }
        }
    }
}
