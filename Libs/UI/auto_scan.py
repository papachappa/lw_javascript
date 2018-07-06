import time
from scan import Scan

from aux_functions import println, open_wizard, send_key_with_verification,\
                          select_on_screen, send_key, wait_for, \
                          check_all_wizard_closed, get_status

from enumerators import MAIN_MENU, SYSTEM_SETTINGS_MENU, STATIONS_MENU, \
                        AUTO_SCAN_WIZARD, START_AUTO_SCAN

class Auto_Scan(Scan):

    def _print_test_decription(self):
        println(("Test description:\n"
            "1. Go to intial state (Dashboard is opend, focuse is on main menu).\n"
            "Test will be terminated if one of wizards is open.\n"
            "2. Open auto scan wizard.\n"
            "3. Go thought auto scan wizard according to test scenario.\n"
            "Test will be terminated if one of required verification is failed.\n"
            "4. Start scan and wait end of scan (10 min timout is set).\n"
            "5. Go thought auto scan wizard according to test scenario.\n"
            "Test will be terminated if one of required verification is failed.\n"
            "6. Close of wizard.\n"))

    def  _open_scan_wizard(self):
        println("\nOpen auto scan wizard.")
        return open_wizard([ MAIN_MENU.SYSTEM_SETTINGS,
                               SYSTEM_SETTINGS_MENU.STATIONS_MENU,
                               STATIONS_MENU.AUTO_SCAN],
                           AUTO_SCAN_WIZARD.FIRST_SCREEN)

    def _close_scan_wizard(self):
        """ Close auto scan wizard in fastest way.


        Returns: True if wizard is closed/ False otherwise
        """
        forward = True
        println("\nClose auto scan wizard")
        initial_status = get_status()
        while forward:
            current_status = get_status()
            if AUTO_SCAN_WIZARD.FIRST_SCREEN in current_status:
                forward = False
                #one 'exit' is workaround to close additional messages
                send_key("EXIT")
                time.sleep(2)
                send_key("EXIT")
                time.sleep(2)
            elif AUTO_SCAN_WIZARD.SCAN in current_status:
                forward = False
                #one 'exit' is workaround to close additional messages
                send_key("EXIT")
                time.sleep(2)
                send_key("EXIT")
                time.sleep(2)
                send_key("EXIT")
                time.sleep(2)
            else:
                if not send_key_with_verification('FWD'):
                    println("#ERROR: TV doesn't react on key >>.")
                    forward = False
                elif get_status() == initial_status:
                    println("#ERROR: UI is cycled.")
                    forward = False

        if not check_all_wizard_closed():
            println("#VERIFICATION FAILED: wizard is not closed")
            return False
        else:
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
        self._go_through_wizard(AUTO_SCAN_WIZARD.FIRST_SCREEN)
        result, status = select_on_screen(START_AUTO_SCAN, 'Start search/update')
        if not result:
            println("VERIFICATION FAILED: Auto scan cannot be started.")
            return False
        send_key("OK")

        result, status = wait_for(AUTO_SCAN_WIZARD.SCAN, 10, 2)
        if result:
            result = True
            println("VERIFICATION PASSED: Auto scan is started.")
        else:
            result = False
            println(("VERIFICATION FAILED: Auto scan is not started during "
                     "10sec.\n \t - UI sate is {}").format(status))
        result, status = wait_for(AUTO_SCAN_WIZARD.SCAN_RESULT, timeout, 2)
        if result:
            println("VERIFICATION PASSED: Scan is executed.")
            return result and True
        else:
            println(("VERIFICATION FAILED: Scan is not finished during {} "
                     "sec.\n \t - UI sate is {}").format(timeout, status))
            return result and False

    def _set_presettings(self, settings):
        println("\nSet scan settings.")
        self._go_through_wizard(AUTO_SCAN_WIZARD.FIRST_SCREEN)
        result, status = select_on_screen(START_AUTO_SCAN, 'Change search settings')
        send_key("OK")
        result, status = wait_for(AUTO_SCAN_WIZARD.SIGNAL_SOURCE, 5, 1)
        if result:
            return self._set_settings(settings)
        else:
            println("VERIFICATION FAILED: Scan settings cannot be set.")
            self._close_scan_wizard()
            return False
