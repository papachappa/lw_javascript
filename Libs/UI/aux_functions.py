import re
import time
import os
from soap_lib import SendKey, GetGuiStatus


def println(text):
    """ Basic function, used to standard printlning and monitoring test result.
        Enviroment variable is initiated if println contains error or fail merkers.

        Args:
            text -- string that should be printlned 
    """
    print(text)
    if "ERROR:" in text or "VERIFICATION FAILED:" in text:
        os.environ['PY_TEST_RESULT'] = "FAIL"

def print_ui_status(uiStatus):
    """ Pretty printlning of UI status

        Args:
            uiStatus -- string that is returned by get_status()
    """

    try:

        formatted_status = re.search("#([^|]+)", uiStatus).group(1) + ". "
        for t in ("Title", "title"):
            srch_str = t + ":(?P<tmp>[^|]+)"
            a = re.search(srch_str, uiStatus)
            if a:
                formatted_status += t + " > " + a.group('tmp') + ". "

        readable = formatted_status.replace("title", "Cursor on")
        println("\tScreen: {}".format(readable))
    except Exception: 
        println("INFO: UI Status Parsing Error {}".format(uiStatus))
    
def send_key(key):
    """ Sends specified key in 3 attempts, imitating remote control.

        Args:
            key -- just name of a key with capital letters, e.g. "FWD", "LEFT"

        Returns: True if responce corresponds success criteria, False if not.

        Raises:  EnvironmentError if unable to get response. 
    """
    #TV ip, that is defined in controller
    host = os.getenv('SOAP_UI_HOST')
    
    #generation of full key name that is requested by soap command
    key_id = "TI-KEY-EVENT-{}".format(key)

    for i in range(2): #3 attemps to send key
        println("Send key {}.".format(key))
        try:
            keyResponse = SendKey(host, key_id).getResponse()
        except Exception as e:
            println("WARN: Key {} is not send.\nReason: {}.".format(key, e))
            
        if keyResponse:
            break
        else:
            #println('send_key: Sleep 1 sec.')
            time.sleep(1)
    else:
        raise EnvironmentError ("Key pressing emulate: 3 attempts failed.")

    if not "1" in keyResponse:
        println("#ERROR: Failed to send key {}, responce: {}.".format(key, keyResponse))
        return False
    else:
        return True    


def get_status():
    """ Gets status of UI in 3 attempts.

        Returns: UI status as it is.

        Raises:  EnvironmentError if unable to get response. 
    """
    host = os.getenv('SOAP_UI_HOST')

    for i in range(2): #3 attemps to get status
        #println("Getting status.")
        try:
            uiStatus = GetGuiStatus(host).getResponse() 
        except Exception as e:
            println("WARN: TV set {} is not available: {}.".format(host, e))
            
        if uiStatus:
            break
        else:
            #println('get_status: Sleep 1 sec.')
            time.sleep(1)
    else:
        println('#ERROR: Unable to get UI status in three attempts.')
        raise EnvironmentError ('Unable to get UI status.')

    #this variable is needed only for preaty printlning to make log shotter
    # and do not println the same UI state sereral times
    
    if 'global_ui_state' in globals():
        if uiStatus != global_ui_state:
            global_ui_state = uiStatus
            print_ui_status(uiStatus)
    else:
        global global_ui_state
        global_ui_state = uiStatus
        print_ui_status(uiStatus)

    return uiStatus


def send_key_with_verification(key):
    """ Verifies if UI state was changed as result of send_key.

        Args:
            key -- just name of a key with capital letters, e.g. "FWD", "LEFT"

        Returns: True if status was changed, False otherwise.
    """
    initialStatus = get_status()
    send_key(key)
    #println('send_key_with_verification: Sleep 1 sec.')
    time.sleep(1)
    resultStatus = get_status()
    if initialStatus == resultStatus:
        println('#WARN: UI status is not changed.')
        return False
    else:
        return True

def open_main_menu():
    """ Reset TV to initial state: Cursor is in any item of main menu

        Returns: True or False 
    """

    # if coursor is not in main menu, then go to left till any
    # menu item is selected. There is different UI implementation in some
    # sw main menu is select then dashboard id open in others dashboard item
    # can be selected
    println(('Reset TV to intial state: close all '
            'wizards, open dashboard and move focuse to main menu.'))

    if go_to("#Dashboard", ["USER-1"], 1):
        println('Dashboard is opened.')
    else:

        if go_to("Dashboard", ["EXIT", "END", "FWD", "USER-1"], 20):
            println('Dashboard is opened.')

        elif go_to("#Button", ["RIGHT"], 5):
            println('CAM search is opened.')

        else:
            println('Dashboard can not be opened.')
            return False
    if go_to("#Dashboard| #List| #Item|title:", ["LEFT"], 7):
        println('Focuse is in main menu.')
        return True
    else:
        println('Focuse can not be moved to main menu.')
        return False

def open_wizard(menu_path, wizard_id, pin="DNC", println_lable="RSLT"):
    """ Open wizard by specific sequence.
        PIN request can be additionally checked.

        Args:
            menu_path -- list of menu items that should be selected one by one
            wizard_id -- UI identificator that should be displayed after all
                         menus are opened
            pin -- "DNC" or list of keys that should be pressed if pin requested.
                   if "DNC" is set then deafult pin witll be used, and only
                   information printlning will be executed. For all other values
                   println will be provided with verification lable.
            println_lable -- "RSLT" is set to determine that result of wizard
                           opening should be used for test result definition.

        Returns: True if requested wizard id opened, False if wizard is not opened
    """

    #define logging level, IF type of verification is RSLT,
    #then VERIFICATION LABLE should be added. '#' is used for errors counting
    #and should be added to fails 
    if println_lable == "RSLT":
        fail_lable = "#VERIFICATION FAILED: "
        pass_lable = "VERIFICATION PASSED: "
    else:
        fail_lable = ""
        pass_lable = ""

    #go thought menu
    for item in menu_path:
        if go_to(item, ["DOWN"]):
            send_key_with_verification("OK")
        else:
            println ("#VERIFICATION FAILED:Expected menu item is not found")
            return False

     #open wizard with closing pin window if pin requested
    result, status = wait_for(wizard_id, 1, 1)
    if result:
        println("{}{} is displayed.".format(pass_lable, wizard_id))
        if pin == "DNC":
            println("INFO: PIN was not requested.")
        elif pin == []:
            println("VERIFICATION PASSED: PIN was not reqiested.")
        else:
            println("#VERIFICATION FAILED: PIN was NOT reqiested.")
        return True
    elif 'Parental lock' in status:
        if pin == "DNC":
            println("INFO: PIN is requested.")
        elif pin == []:
            println("#VERIFICATION FAILED: PIN IS reqiested.")
        else:
            println("VERIFICATION PASSED: PIN is reqiested.")

        #define test pin, 1234 is default    
        if pin == "DNC" or pin == []:
            pin = ["KEY-1","KEY-2","KEY-3","KEY-4"]
        println("Close PIN request by enterung {}.".format(pin))
        #enter pin and check that requested wizard is opened
        navigate_and_status(pin)
        result, status = wait_for(wizard_id, 1, 1)
        if result:
            println("{}{} is displayed.".format(pass_lable, wizard_id))
            return True
        else:
            println("{}{} IS displayed.".format(fail_lable, wizard_id))
            return False
    else:
        println("{}{} IS displayed.".format(fail_lable, wizard_id))
        return False


def wait_for(status, duration=5, period=5):
    """ Waiting for requested status for a given duration, checks every given period.

        Args:
            status -- requested status. 
            duration -- duration of waiting (non-integral values supported)
            period -- check frequency (non-integral values supported)

        Returns: Current status. 
                 True if requested status reached. False otherwise.
    """

    if period == 0:
        period = duration  # check status twice, at begining and at the end
    for s in range(int(duration/period)+1):
        guiStatus = get_status()
        if not guiStatus:
            println("WARN: Error getting GUI status.")
            #println("wait_for: Sleep for {} sec.".format(period))
            time.sleep(period)
            continue
        if status in guiStatus:
            result = True
            #println("GUI Status {} is available." % guiStatus)
            break
        else:
            if s < int(duration/period):
                #println("wait_for: Sleep for {} sec.".format(period))
                time.sleep(period)
            #continue
    else:
        result = False
        #println("ERROR: Wrong screen.")
    return result, guiStatus


def go_to(item, keys, number_of_iterations=10):
    """ Go to UI state by specific sequence of key sendings.
        Function will check that UI is changes and uncycled

        Args:
            item -- any text in UI status that should be used as identificator
            keys -- sequesnce of RC keys
            number_of_iterations -- number of attempts to reach expected UI state

        Returns: True if requested UI is opened, False if UI is not opened by any reason
    """
    start_status = get_status()
    #go to UI if current is different
    if item not in start_status:
        #println("Go to '%s' .\n Prior status is: %s ." % (item, start_status))
        println("Go to '{}'.".format(item))
        status_initial = start_status
        status = start_status
        count = 0
        while not item in status:
            result, status = navigate_and_status(keys, item, 1, 1)
            count += 1
            if not result:
                if status == status_initial:
                    println("INFO: TV does not react on keys pressing.")
                    return False
                elif status == start_status:
                    println("INFO: UI is cycled.")
                    return False
                else:
                    status_initial = status
                if count == number_of_iterations:
                    println("INFO: Unable to get to {} in {} attempts".format(item, count))
                    return False
            else:
                #println("Requested UI '{}' is opened.".format(item))
                return True
    else:
        return True


def navigate_and_status(sequence=[], status="", duration=5, period=5):
    """ Navigates the path is given, verifies the status if given 
        
        Args:
            sequence -- sequence of keys
            status -- optional. expected status.
            duration -- duration of a test (non-integral values supported)
            period -- period of a single loop (non-integral values supported)

        Returns: True if requested screen is reached successfully, False if not. 
                 Current status.
    """
    initial_status = get_status()
    for i in sequence:
        if not send_key(i):
            println("Send Key Failed\n")
            return False, get_status()
        #println('navigate_and_status: Sleep 1 sec.')
        time.sleep(1)
    println("Send Key Success\n")
    current_status = get_status()
    if status == "":
        return True, current_status
    elif initial_status == current_status:
        result, status = wait_for(status, duration, period)
        return result, status
    elif status in current_status:
        return True, current_status
    else:
        return False, current_status



def select_on_screen(screen, request):
    """ Navigates through the table on a screen.
        
        Args:
            screen -- dictionary describing screen, containing count of rows 
                      and list of values. See example in enumerators.py.
            request -- requested value.

        Returns: True if requested value is selected, False is otherwise
    """
    #Get initial status
    current_status = get_status()

    #Getting selected element from status.

    t = re.search('\|title:(?P<item>[^|]+)', current_status)
    if t == None:
        t = re.search('Button\|text:(?P<item>\w+)', current_status)
    

    stat = t.group('item')#[:-1]

    # t = re.search('Button\|text:(?P<button>\w+)', current_status)
    # statt = tt.group('button')#[:-1]


    els = screen['elements']
    print(t, stat, els)
    #Check if statuses are valid
    if stat not in str(els) or request not in str(els):
        println("ERROR: We are on wrong screen or Enumerators update is required.")
        if stat not in str(els):
            println("INFO: '{}' items is not found".format(stat))
        if request not in str(els):
            println("INFO: '{}' items is not found".format(request))
        return False, current_status

    #Navigate from A to B
    #(x,y) = tuple(map(lambda x, y: y - x, screen[stat], screen[request]))
    xstat = (els.index(stat)) // screen['rows']
    ystat = (els.index(stat)) % screen['rows']
    xreq = (els.index(request)) // screen['rows']
    yreq = (els.index(request)) % screen['rows']
    #println("xstat = %s, xrequest = %s" % (els.index(stat), els.index(request)))
    x = xreq - xstat
    y = yreq - ystat

    if x!=0 or y != 0:
        println("Move cursor to '{}'." .format(request))
    else:
        return True, current_status

    #println("xstat = %s, ystat = %s" % (xstat, ystat))
    #x, y = screen[stat] - screen[request]
    sequence = []

    def countx():
        key = "LEFT" if x < 0 else "RIGHT"
        for i in range(abs(x)): 
            sequence.append(key)
    
    def county():
        key = "UP" if y < 0 else "DOWN"
        for i in range(abs(y)): 
            sequence.append(key)


    if not len(els) % screen['rows'] == 0 and xreq == len(els)/screen['rows'] + 1:
        county()
        countx()
    else:
        countx()
        county()

    return navigate_and_status(sequence, request)

            
def check_all_wizard_closed():
    """ Check no wizard is diaplyed.
    verification is executed by clock displaying

        Args:
            host -- IP of a tested TV

        Returns: True if clocke is selected, False is otherwise
    """
    result, status = wait_for("AppWindow", 2, 1)
    if not result:
        println("There is no opened wizard.")
        return True
    else:
        println("Some wizard is opened.")
        println("INFO: UI - {}".format(status))
        return False

def finish_test():
    """ Printing test result (taken from the envronment variable).

        Args:
            host -- IP of a tested TV
    """

    println("Test finished.")

    if os.environ.get('PY_TEST_RESULT') == "FAIL":
        println("Test result: TEST_FAILED")
    else:
        println("Test result: TEST_PASSED")


