include('Utilities.js');
include('Structures.js');
include('ServiceMode.js');

init = function() {
/** @namespace
 * Work with timers
 * @requires Library: {@link Utilities}
*/
Timer = {

/**
 * Set Timer to wake up
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
 * @param {function} exitFunc
 * Fuction to call if wake up time is set correctly.
 * @param {function} failFunc
 * Fuction to call if WRONG wake up time is set.
 * @param {number} mediaType
 * Resource that should be shown after TV wake up.
 * Note! TV 1|4, Radio 2|8. Values 4 and 8 is added for compatibility
 * with standart Enumerators.js lib
 * @param {number} gap
 * Time in sec when TV should wake up
 * @example
 * //Wake up in 3min and display TV service.
 * Timer.setAlarmOnceTimer (switchOffTV, stopTest, MediaType.TV, 180)
*/
setAlarmOnceTimer: function (exitFunc, failFunc, mediaType, gap) {
    if (mediaType == 4 ){
        mediaType = 1;
    }
    if (mediaType == 8 ){
        mediaType = 2;
    }
    var ALARM_ONCE = 1 << 8;

    var alarmOnce = de.loewe.sl2.i32.timerfunctions.alarm.once;
    var alarmSource = de.loewe.sl2.i32.timerfunctions.alarm.source;
    var alarmDevice = de.loewe.sl2.i32.timerfunctions.alarm.device;

    function alarmSet(){
        var newWakeUpTime = alarmOnce.getValue();
        var newMin = (newWakeUpTime%3600-((newWakeUpTime%3600)%60))/60;
        if (newMin < 10){
            newMin = "0".concat(newMin)
        }
        var newHours = (newWakeUpTime - newWakeUpTime%3600)/3600;
        if (newWakeUpTime == wakeUpTime){
            Utilities.print("#VERIFICATION PASSED: Wake up time is set at "
                            + newHours + ":" + newMin  + " of TV time.");
            exitFunc()
        }
        else{
            Utilities.print("#VERIFICATION FAILED: Wake up time is set at "
                            + newHours + ":" + newMin  + " of TV time.");
            Utilities.print("INFO: The expected wake up time is "
                     + newWakeUpTime
                     + " and the actual wake up time is " + wakeUpTime);
            failFunc();
        }
    }

    if (ServiceMode.checkChassisOption("SysTimeSource", 3)) {
        Utilities.print("The 'SysTimeSource' option already has the expected "
                        + "value.");
    }
    else {
        Utilities.print("WARN: The 'SysTimeSource' is set to '" +
                        ServiceMode.getChassisOption("SysTimeSource")
                        + "' (expected '3').");
        //ServiceMode.setChassisOption(exitFunc,"SysTimeSource", 3);
    }
    Utilities.print("Set wake up time...");
    Structures.delayedListener(alarmOnce, alarmSet, 10000);
    alarmDevice.setValue(mediaType);
    var wakeUpTime = Timer.calculateFutureTvTime(gap);
    alarmOnce.setValue(wakeUpTime);
    alarmSource.setValue(ALARM_ONCE);
},

/**
 * Calculate the time that will be on TV in some seconds.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
 * @param {number} sec
 * Number of seconds
 * @return TV time in seconds
*/
calculateFutureTvTime: function (seconds) {
    var tvTime = de.loewe.sl2.i64.datetime.time.utc.getValue();
    var updateTime = de.loewe.sl2.i64.datetime.deviation.next.change.utc
                                                            .getValue();
    if (tvTime < updateTime){
        var timeZomeCorrection = de.loewe.sl2.i32.datetime.deviation
                                                    .fromutc.getValue();

    }
    else{
        var timeZomeCorrection = de.loewe.sl2.i32.datetime.deviation
                                                       .next.getValue();
    }
    

    var utcSeconds = tvTime*1000;
    var d = new Date(utcSeconds);
    //timer time should be set in sec hour+min from now
    var currentMin = d.getUTCMinutes()+(timeZomeCorrection%3600)
    var currentHours = d.getUTCHours()
                        +((timeZomeCorrection
                        -(timeZomeCorrection%3600))/3600)
    if (currentMin < 10){
        Utilities.print("INFO: Current TV time is " + currentHours+":0"+currentMin);

    }
    else{
        Utilities.print("INFO: Current TV time is " + currentHours+":"+currentMin);
    }
    
    return currentHours*3600+currentMin*60+seconds
},

/**
 * Check TV time
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
 * @param {number} expectedUTCtime
 * Expected lower limit of TV time in UTC standart
 * @param {number} allowableError
 * Permissible error in seconds
 * @return {true|false}
*/
checkTime: function (expectedUTCtime, allowableError) {
    var tvTime = de.loewe.sl2.i64.datetime.time.utc.getValue();
    var updateTime = de.loewe.sl2.i64.datetime.deviation.next.change.utc.getValue();
    if (tvTime < updateTime){
        var deviation = de.loewe.sl2.i32.datetime.deviation.fromutc.getValue();
    }
    else{
        var deviation = de.loewe.sl2.i32.datetime.deviation.next.getValue();
    }
    var date = new Date(tvTime*1000);
    var tvMin = date.getUTCMinutes()+(deviation%3600)
    if (tvMin<10){
            tvMin = "0".concat(tvMin)
        }
    var tvHour = date.getUTCHours()+((deviation-(deviation%3600))/3600)

    Utilities.print("INFO: Expected UTC time: " + expectedUTCtime);
    Utilities.print("INFO: TV UTC time: " + tvTime);

if (  (tvTime > expectedUTCtime - allowableError
      && tvTime < expectedUTCtime + allowableError)
        || tvTime == expectedUTCtime) {
         Utilities.print("Current TV GMT time is "
             + tvHour + ":" + tvMin + " what is corresponding to expected value"
             + " in the limit of permissible error.");
        return true
    }
    else{
         Utilities.print("WARN: Current TV GMT time is "
             + tvHour + ":" + tvMin + " what is NOT corresponding to expected value"
             + " in the limit of permissible error.");
        return false
    }

},

/**
 * Check time zone
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
 * @param {number} expectedtimeZone
 * Expected time zone
 * @return {true|false}
*/
checkTimeZone: function (expectedtimeZone) {

    var timeZone = {
        description: "time zone",
        api: de.loewe.sl2.i32.datetime.deviation.fromutc
    }

    return Utilities.getCheckAPIValue(timeZone, expectedtimeZone, "RSLT");

},

/**
 * Check next time zone
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
 * @param {number} expectedtimeZone
 * Expected time zone
 * @return {true|false}
*/
checkNewTimeZone: function (expectedtimeZone) {

    var api = {
        description: "next time zone",
        api: de.loewe.sl2.i32.datetime.deviation.next
    }

    return Utilities.getCheckAPIValue(api, expectedtimeZone, "RSLT");

},

/**
 * Check time of zone update
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
 * @param {number} timeOfChange
 * Expected time zone
 * @return {true|false}
*/
checkTimeZoneUpdate: function (timeOfChange) {

    var api = {
        description: "time of zone update",
        api: de.loewe.sl2.i64.datetime.deviation.next.change.utc
    }

    return Utilities.getCheckAPIValue(api, timeOfChange, "RSLT");

},

/**
 * Print TV time
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Timer
*/

printTVTime: function () {
    var tvTime = de.loewe.sl2.i64.datetime.time.utc.getValue();
    var updateTime = de.loewe.sl2.i64.datetime.deviation.next.change.utc.getValue();
    if (tvTime < updateTime){
        var deviation = de.loewe.sl2.i32.datetime.deviation.fromutc.getValue();
    }
    else{
        var deviation = de.loewe.sl2.i32.datetime.deviation.next.getValue();
    }
    var date = new Date(tvTime*1000);
    var tvMin = date.getUTCMinutes()+(deviation%3600)
    if (tvMin<10){
            tvMin = "0".concat(tvMin)
        }
    var tvHour = date.getUTCHours()+((deviation-(deviation%3600))/3600)
    Utilities.print("Current TV GMT time " + tvHour + ":" + tvMin)

}

}
}
