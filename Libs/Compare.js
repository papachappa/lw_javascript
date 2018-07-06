include('Utilities.js');

init = function() {
/** @namespace
 * Functions to execute arrays comparison.
 * @requires Library: {@link Utilities}
*/
Compare = {

/**
 * Compare two arrays
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @author Andrey Oleynik avoleynik@luxoft.com
 * @memberof Compare
 * @param {array} array1
 * First array to be compared
 * @param {array} array2
 * Second array to be compared
 * @return array of differences [[arra1][arra2]]
 * @example
 * // return [[],[1,3,2]]
 * arr1 = [
 *     [1,2,3],
 *     [1,2,3],
 *     [1,2,4]
 * ]
 * arr2 = [
 *      [1,2,3],
 *      [1,2,4],
 *      [1,2,3],
 *      [1,3,2],
 * ]
 * Compare.compareArrays(arr1, arr2)
*/
compareArrays: function (array1, array2) {
    function makeDictionary(array2D) {
        var hashTable = {};
        array2D.forEach(
            function(line){
        var hash = line.join(";");
        if (hashTable.hasOwnProperty(hash)) {
            hashTable[hash]["counter"]++;
        }
        else {
            hashTable[hash] = {
            "value": line,
            "counter": 1
            };
        }
            }
        );
        return hashTable;
    }

    function compareDictionaries (dict1, dict2) {
        var diffArray = [];
        for (hash in dict1) {
        var diff = dict1[hash]["counter"];
            if (dict2.hasOwnProperty(hash)) {
                diff = diff - dict2[hash]["counter"];
        }
        if (diff > 0) {
        for (var i = 0; i < diff; i++) {
            diffArray.push(dict1[hash]["value"]);
        }
        }
        }
        return diffArray;
    }

    var dictA = makeDictionary(array1);
    var dictB = makeDictionary(array2);
    return [compareDictionaries(dictA, dictB),
        compareDictionaries(dictB, dictA)];
},

/**
 * Make dictionary for list comparison with line indentificator
 * @author Andrey Oleynik avoleynik@luxoft.com
 * @memberof Compare
 * @param {array} dict
 * Array specified by tester, a list of properties of a single service
 * e.g. [<ChannelName>, <LCN>, <Type>]
 * @param {array} compare
 * Array of service properties to be compared with "dict".
 * Columns of both arrays must correspond to each other.
 * @param {number} frInd
 * Index of the field with frequency
 * @param {number} frRange
 * Acceptable range of comparing flexibility
 * @param {number} sbInd
 * Index of the field with symbolrate
 * @param {number} sbRange
 * Acceptable range of comparing flexibility in %
 * @return {boolean}
 * "True" if both arrays are equal, "false" otherwise; "DNC" counts as a
 * wildcard, i. e. fields with "DNC" are just ignored during comparison.
*/
compareServices: function (refer, compare, frInd, frRange, sbInd, sbRange) {
    var referCopy = refer.slice();
    var compareCopy = compare.slice();
    var frInd = Number(frInd) || referCopy.length;
    var frRange = Number(frRange) || 0;
    var sbInd = Number(sbInd) || referCopy.length;
    var sbRange = Number(sbRange) || 0;
    var re = /\{(\d+)-(\d+)\}/g;
    
    // Delete from expected services "do not check" elements
    function do_not_check_item() {
        referCopy.splice((k), 1);
        compareCopy.splice((k), 1);
        if (k < frInd) {
        frInd--;
        }
        if (k < sbInd) {
        sbInd--;
        }
    }

    for (var k = referCopy.length-1; k >= 0; k--) {
    
        if (referCopy[k] == "DNC") {
            do_not_check_item()
        }

        else if (String(referCopy[k]).search(re) != -1) {
            var match = re.exec(String(referCopy[k]));
            if (Number(match[2]) > Number(match[1])){
                if (Number(compareCopy[k]) >= Number(match[1]) && Number(compareCopy[k]) <= Number(match[2])) {
                    do_not_check_item()
                }
            }
            else {
                Utilities.print("VERIFICATION FAILED: First Number In Range Less Than Second")
            }

        }

    }
    return (
    referCopy.length == compareCopy.length &&
    referCopy.every(
        function(item, index) {
            if ((index === frInd) && (compareCopy[index] != "NA")) {
                return (Math.abs(Number(compareCopy[index]) - Number(item)) <= frRange);
            }
            else if ((index === sbInd) && (compareCopy[index] != "NA")) {
                range = Number(item)*sbRange/100;
                return (Math.abs(Number(compareCopy[index]) - Number(item)) <= range);
            }
            else {
                return (item === compareCopy[index]);
                // To compare char by char
                /* for (var i = 0; i < item.length; i++) {
                    if (item[i] !== compareCopy[index][i]) {
                        Utilities.print("DEBUG: item is " + item);
                        Utilities.print("DEBUG: compareCopy[index] is " + compareCopy[index]);
                        Utilities.print("Character number " + i + ", '###" + item[i].charCodeAt() + "###'");
                        Utilities.print("Character number " + i + ", '###" + compareCopy[index][i].charCodeAt() + "###'");
                        return false;
                    }
                }
                return true; */
            }
        }
    )
    );
},

/**
 * Make dictionary for list comparison with line indentificator
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @author Andrey Oleynik avoleynik@luxoft.com
 * @memberof Compare
 * @param {array} expected
 * 2D array specified by tester, every row of that
 * is a list of properties of a single service
 * e.g. [[<ChannelName1>, <LCN1>, <Type1>],
 *       [<ChannelName2>, <LCN2>, <Type2>],
 *                      ...
 *       [<ChannelName#N>, <LCN#N>, <Type#N>]]
 * @param {array} actual
 * 2D array of services returned by a TV set; first columns of
 * this array must corrrespond to columns of "expected" array
 * e.g. [[<ChannelName1>, <LCN1>, <Type1>, <InternalIndex1>],
 *       [<ChannelName2>, <LCN2>, <Type2>, <InternalIndex2>],
 *                      ...
 *       [<ChannelName#N>, <LCN#N>, <Type#N>, <InternalIndex#N>]]
 * @param {function} idFunction
 * Rule for identifier definitions
 * (should return an identifier for input arrays),
 * e.g. function (arrayRow) {return arrayRow[1];}
 * The function in example returns value of first element for every service.
 * For example arrays it will be LCN.
 * @param {number} condInd
 * Index of the field to be "flexibly" compared
 * @param {number} range
 * Acceptable range of comparing flexibility
 * @return {array}
 * A hash map (or "identifier" map) containing an array of lists
 * for every identifier; each of these lists has three keys:
 * "value", "expected" and "actual".
 * -- "value" key contains rows from input arrays.
 * -- "expected" key contains expected number of corresponding rows.
 * -- "actual" key contains actual number of corresponding rows.
 * If there are several rows with the same identifier, new list is added
 * to the array corresponding to generated identifier for each row.
 * If there is no rows with the given identifier in one of arrays,
 * then corresponding counter key ("expected" or "actual") has zero value.
 * @example
 * //Note: Orders of rows in arrays are not required to match.
 * {
 * "LCN1":{
 *         expected: [<ChannelName1>, <LCN1>, <Type1>],
 *         actual: [<ChannelName1>, <LCN1>, <Type1>, <InternalIndex1>]
 *        },
 * "LCN#I":{
 *         expected: [<ChannelName#I>, <LCN#I>, <Type#I>],
 *         actual: []
 *        },
 * "LCN#K":{
 *         expected: [],
 *         actual: [<ChannelName#K>, <LCN#K>, <Type#K>, <InternalIndex#K>]
 *        },
 *}
*/
makeDictionary: function (expected, actual, idFunction, condInd, range, sbInd, sbRange) {
    var dict = {};

    expected.forEach(
        function(line) {
        var id = idFunction(line);
            if (!dict.hasOwnProperty(id)) {
                dict[id] = [];
        }

        if (!dict[id].some(
        function(item) {
            if (Compare.compareServices(line, item["value"], condInd, range, sbInd, sbRange)) {
            item["expected"]++;
            return true;
            }
        }
        )) {
        var newLine = {
            "value": line,
            "expected": 1,
            "actual": 0
        };
        dict[id].push(newLine);
        }
        }

    );

    actual.forEach(
        function(line) {
        var id = idFunction(line);
            if (!dict.hasOwnProperty(id)) {
                dict[id] = [];
        }

        // In case of additional field (unique identifier)
        // we need to skip it during comparison, but also
        // store it in a separate field (Scan.js needs it)
        var uuid = null;
        if (typeof(expected[0]) == "undefined"){
			expected[0] = []
		}

        // If some test fails try to uncomment this block
        var ldiff = line.length - expected[0].length;
        //Utilities.print("ldiff: " + ldiff);
        if (ldiff > 0) {
        // // For an unknown reason, without next ridiculous line,
        // // code just hangs up and stays there. Mysterious.
        line = line.slice();
        //Utilities.print("line: " + line);
        //Utilities.print("uuid: " + uuid);
        //for(var keys = Object.keys(line), i = 0, end = keys.length; i < end; i++) {
        //var key = keys[i], value = line[key];
        //Utilities.print("KEY " + key)
        //Utilities.print("VALUE " + value)
        //if (value.match("ch")) {
            //Utilities.print("CH IN VALUE!!!!")
            //line.pop(value)
            //}
// do what you need to here, with index i as position information
//};

        //Utilities.print("LINE IS " + line)
//Function below delete the last element after autoscan and in test of verification of scrambled services - incorrect.
//And delete additional last element for manual scan - correct.
        if (line.length == 9 || line.length == 7) {
            uuid = line.pop();
        }
        // // If there's more than one "extra" field in actual line
        //line.length = expected[0].length;
        }

        if (!dict[id].some(
        function(item) {
            if (Compare.compareServices(item["value"], line, condInd, range, sbInd, sbRange)) {
            item["actual"]++;
            item["uuid"] = uuid;
            return true;
            }
        }
        )) {
        var newLine = {
            "value": line,
            "expected": 0,
            "actual": 1,
            "uuid": uuid
        };
        dict[id].push(newLine);
        }
        }
    );

    return dict;
},

/**
 * Pretty print of list comparison.
 * The function prints all distinctions in expected and actual results
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @author Andrey Oleynik avoleynik@luxoft.com
 * @memberof Compare
 * @param {array} dictionary
 * Hash map containing expected (defined by tester) and
 * actual (returned by TV set) results; created by makeDictionary()
 * @param {array} headers
 * Array of column names in expected result
 * (in corresponding oreder), e.g. ["Name", "LCN", "ONID", "TSID", "SID"
 * @param {string} {checkType="INFO"|"WARN"|"RSLT"|"#ERROR "}
 * Type of verification. For "RSLT", failed result will be marked by
 * "#VERIFICATION FAILED", for others types failed result will be marked
 * by lable. Equality result will be marked as "#VERIFICATION PASSED".
 * Default value is "RSLT".
 * @return {true|false}
 * The function return "true" if results are matched and "false" otherwise.
 * @requires Library: {@link Utilities}
*/
compareDictionaries: function (dictionary, headers, checkType) {
    var checkType = checkType || "#VERIFICATION FAILED";
    if (checkType == "RSLT") {
    checkType = "#VERIFICATION FAILED";
    }

    function makeResult(dictionary) {
    var dict = {};

    for (hash in dictionary) {
        dictionary[hash].forEach(
        function(line) {
            var diff = line["expected"] - line["actual"];
            if (diff != 0) {
            if (!dict.hasOwnProperty(hash)) {
                dict[hash] = {};
            }
            if (diff > 0) {
                if (!dict[hash].hasOwnProperty("expected")) {
                dict[hash].expected = [];
                }
                for (var i = 0; i < diff; i++) {
                dict[hash].expected.push(line["value"]);
                }
            }
            else {
                if (!dict[hash].hasOwnProperty("actual")) {
                dict[hash].actual = [];
                }
                for (var i = diff; i < 0; i++) {
                dict[hash].actual.push(line["value"]);
                }
            }
            }
        }
        );
    }
    return dict;
    }

    function prettyPrint(arr) {
        return arr.reduce(
            function(accum, item) {
                return accum + '"' + item + '", '
            },
            "[ ").slice(0, -2) + " ],";
    }

    function printResult(dict) {
    var result = {
        "notFound": {},
        "notExpected": {},
        "changed": {}
    };

    for (key in dict) {
        if (!dict[key].hasOwnProperty("actual")) {
        result.notFound[key] = dict[key];
        }
        else if (!dict[key].hasOwnProperty("expected")) {
        result.notExpected[key] = dict[key];
        }
        else {
        result.changed[key] = dict[key];
        }
    }

    if (Object.keys(result.notFound).length != 0) {
        Utilities.print("++++++++++++++++++");
        Utilities.print(checkType + ": some rows were NOT FOUND!"
                + "\nFields: " + headers.join(", "));
        for (key in result.notFound) {
        Utilities.print(key + ":");
        result.notFound[key].expected.forEach(
            function(line) {
            Utilities.print("# " + prettyPrint(line));
            }
        );
        }
        Utilities.print();
    }

    if (Object.keys(result.notExpected).length != 0) {
        Utilities.print("++++++++++++++++++");
        Utilities.print(checkType + ": some rows were NOT EXPECTED!"
                + "\nFields: " + headers.join(", "));
        for (key in result.notExpected) {
        Utilities.print(key + ":");
        result.notExpected[key].actual.forEach(
            function(line) {
            Utilities.print("# " + prettyPrint(line));
            }
        );
        }
        Utilities.print();
    }

    if (Object.keys(result.changed).length != 0) {
        Utilities.print("++++++++++++++++++");
        Utilities.print(checkType + ": some rows were CHANGED!"
                + "\nFields: " + headers.join(", "));
        for (key in result.changed) {
        Utilities.print("\n" + key + ":");
        Utilities.print("# Expected result:");
        result.changed[key].expected.forEach(
            function(line) {
            Utilities.print("# " + prettyPrint(line));
            }
        );
        Utilities.print("# Actual result:");
        result.changed[key].actual.forEach(
            function(line) {
            Utilities.print("# " + prettyPrint(line));
            }
        );
        }
        Utilities.print();
    }
    }

    var resultDict = makeResult(dictionary);

    if (Object.keys(resultDict).length == 0) {
        Utilities.print("#VERIFICATION PASSED: Results are identical.");
        return true;
    }
    else {
    printResult(resultDict);
        return false;
    }
}

}
}
