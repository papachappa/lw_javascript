import time
from scan import Scan

from aux_functions import println, open_wizard, send_key_with_verification,\
                          select_on_screen, send_key, wait_for, get_status, open_main_menu,\
                          check_all_wizard_closed 

from enumerators import MAIN_MENU, SYSTEM_SETTINGS_MENU, EXTRAS_MENU, \
                        INITIAL_SCAN_WIZARD, NETWORK_CONFIGURATION,\
                        START_SCAN


class Intial_Scan(Scan):

    def _print_test_decription(self):
        println(("Test description:\n"
            "1. Go to intial state (Dashboard is opend, focuse is on main menu).\n"
            "Test will be terminated if one of wizards is open.\n"
            "2. Open initial scan wizard.\n"
            "3. Go thought intitial scan wizard according to test scenario.\n"
            "Test will be terminated if one of required verification is failed.\n"
            "4. Start scan and wait end of scan (10 min timout is set).\n"
            "5. Go thought intitial scan wizard according to test scenario.\n"
            "Test will be terminated if one of required verification is failed.\n"
            "6. Close of wizard.\n"))


    def  _open_scan_wizard(self):
        println("\nOpen intial scan wizard.")
        return open_wizard([ MAIN_MENU.SYSTEM_SETTINGS,
                             SYSTEM_SETTINGS_MENU.EXTRAS,
                             EXTRAS_MENU.INITIAL_SCAN],
                           INITIAL_SCAN_WIZARD.FIRST_SCREEN)


    def _close_scan_wizard(self):
        """ Close initial scan wizard in fastest way.
        Intial scan wizard can be closed in different way:
        1. Cancel scan
        2. Close wizard from scan result screen
        3. Close wizard from network configuration screen
        4. Close wizard from software update screen
        If current screen is not a screen where wizard can be closed, then >>
        will be pressed.
        Reset_to_initial_state() will be called if wizard is not closed from firts attempt,
        if wizard id cycled, if tV doesn't react on key pressing.

            
        Returns: True if wizard is closed/ False otherwise
        """
        forward = True
        println("\nClose initial scan wizard")
        initial_status = get_status()
        println("DEBUG: PRINTING GET STATUS %s" % initial_status)
        while forward:
            current_status = get_status()
            if INITIAL_SCAN_WIZARD.LICENCE in current_status:
                println("INFO: Licence agreement is displayed.")
                send_key_with_verification('OK')
            elif INITIAL_SCAN_WIZARD.NETWORK_CONFIGURATION in current_status:
                forward = False
                selected, status = select_on_screen(NETWORK_CONFIGURATION,
                                    'Do not configure or configure later')
                if selected:
                    send_key("OK")
                    time.sleep(2)
                    send_key("EXIT")
                    time.sleep(2)
                    send_key("EXIT")
                    time.sleep(2)
                else:
                    println(("#ERROR: Initial scan wizard cannot be closed "
                        "from '{}' screen.").format(INITIAL_SCAN_WIZARD.NETWORK_CONFIGURATION))
                    println("INFO: UI status - {}".format(status))
            elif INITIAL_SCAN_WIZARD.START_SCAN in current_status:
                forward = False
                selected, status = select_on_screen(START_SCAN, 'Cancel')
                if selected:
                    send_key("OK")
                    time.sleep(2)
                    send_key("EXIT")
                    time.sleep(2)
                    send_key("EXIT")
                    time.sleep(2)
                else:
                    println(("#ERROR: Initial scan wizard cannot be closed "
                        "from '{}' screen.").format(INITIAL_SCAN_WIZARD.START_SCAN))
                    print("INFO: UI status - {}".format(status))
                    open_main_menu()
            elif INITIAL_SCAN_WIZARD.SCAN_RESULT in current_status:
                forward = False
                println("DEBUG: BEFORE GET STATUS")
                send_key("EXIT")
                time.sleep(2)
                send_key("EXIT")
                time.sleep(2)
            elif INITIAL_SCAN_WIZARD.INFORM_ABOUT_NEW_SOFTWARE in current_status:
                forward = False
                send_key("EXIT")
                time.sleep(2)
                #workaround: additional pressing 'back' to close any message if displayed
                send_key("EXIT")
                time.sleep(2)
            else:
                if not send_key_with_verification('FWD'):
                    println("#ERROR: TV doesn't react on key >>.")
                    forward = False
                elif get_status() == initial_status:
                    println("#ERROR: UI is cycled.")
                    forward = False


        println("DEBUG: AFTER GET_STATUS")
        result = check_all_wizard_closed()
        println("DEBUG: RESULT IS {}".format(result))
        if not result:
            println("#VERIFICATION FAILED: wizard is not closed")
            return False
        else:
            return True

    def _go_through_wizard(self, item):
        """ Go throught initial scan wizard without verification.
        On License screen "OK" will be send, for all other screens
        FWD will be used to go to next screen

        Args:
            item -- UI there passing should be stopped
            
        Returns: True if requested screen id opened, False if screen is not opened
        """
        start_result, status = wait_for(item, 1, 1)
        if not start_result:
            println("Go to screen, that contais '{}' text.".format(item))
            while not item in status:
                if INITIAL_SCAN_WIZARD.LICENCE in status:
                    println("INFO: Licence aggrement is displayed.")
                    send_key_with_verification('OK')
                    result, status = wait_for(item, 1, 1)
                elif INITIAL_SCAN_WIZARD.PARENTAL_LOCK in status:
                    println("INFO: Parental Lock is displayed.")
                    println("Set PIN 1234.")
                    navigate_and_status(["KEY-1","KEY-2","KEY-3","KEY-4"])
                else:
                    if send_key_with_verification('FWD'): 
                        result, status = wait_for(item, 1, 1)
                        if status == start_result:
                            println("#ERROR: No item {} in initial scan wizard.".format(item))
                            return False
                    else:
                        println("#ERROR: TV doesn't react on key >>.")
                        return False
        println("VERIFICATION PASSED: Requested scren {} is opened.".format(item))
        return True

    def _start_scan(self, timeout=180):
        """ Start and execute scan
        1. Go throught initial scan wizard without verification till screen
        where "Start scan" is possible.
        2. Start scan
        3. Verifay that scan is started.
        4. Wait during timeout that scan is finnished.

        Args:
            timeout -- timeout of scan result waiting in sec
            
        Returns: True scan is executed, False is scan is not executed as expectd by
        any reason
        """
        self._go_through_wizard(INITIAL_SCAN_WIZARD.START_SCAN)
        result, status = select_on_screen(START_SCAN, 'Start automatic search')
        if not result:
            println("VERIFICATION FAILED: Scan cannot be started.")
            return False
        send_key("OK")
        result, status = wait_for(INITIAL_SCAN_WIZARD.SCAN, 10, 2)
        if result:
            result = True
            println("VERIFICATION PASSED: Scan is started.")
        else:
            result = False
            println(("VERIFICATION FAILED: Scan is not started during "
                     "10sec.\n \t - UI sate is {}").format(status))

        result, status = wait_for(INITIAL_SCAN_WIZARD.SCAN_RESULT, timeout, 2)
        if result:
            println("VERIFICATION PASSED: Scan is executed.")
            return result and True
        else:
            println(("VERIFICATION FAILED: Scan is not finished during {} "
                     "sec.\n \t - UI sate is {}").format(timeout, status))
            return result and False
        
        
