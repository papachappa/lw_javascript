from aux_functions import println, open_main_menu, \
                          wait_for, select_on_screen, check_all_wizard_closed, \
                          finish_test, navigate_and_status, go_to, send_key_with_verification

class Scan:

    def __init__(self):
        return

    def _print_test_decription(self):
        println("NO DESCRIPTION IS AVAILABLE.")
        return True


    def _reset_to_initial_state(self):
        result = open_main_menu()
        if not result: 
            println("#ERROR: Initial state is not reached. Test will be terminated.\n")
            finish_test()
        return result


    def _open_scan_wizard(self):
        println("No actions are required to open scan wizard.")
        return True


    def _scan_preparation(self):
        result = self._open_scan_wizard()

        if not result:
            println('#ERROR: Expected wizard is NOT opened.')
            self._reset_to_initial_state()
            finish_test()

        return result

    def _go_through_wizard(self, screen):
        println("Start _go_through_wizard functions")
        return go_to(screen,['FWD'], 20)


    def __select(self, item):
        """ Privat function for scan_interpritator
        Select item on screen and print pretty log

        Raises: ValueError if unable to get response. 
        """
        result, status = select_on_screen(item[0], item[1])
        if result:
            println("VERIFICATION PASSED: Requested element '{}' is selected".format(item[1]))
        else:
            println("#VERIFICATION FAILED: Requested element '{}' is NOT selected".format(item[1]))
            println("INFO: UI status - {}".format(status))
            println("Test will be terminated.")
            raise ValueError("Expected element cannot be selected.")


    def __navigate(self, sequence=[]):
        """ Privat function for scan_interpritator
        Press any sequancy of keys. 
        """
        println("Start Navigate")
        navigate_and_status(sequence)


    def __check(self, element):
        """ Privat function for scan_interpritator
        Check if mentioned element is present is UI status

        Raises: ValueError if unable to get response.
        """
        
        println("START CHEKING")
        result, status = wait_for(element, 1, 1)
        if result:
            println("VERIFICATION PASSED: Requested element '{}' is present in UI".format(element))
        else:
            println("#VERIFICATION FAILED: Requested element '{}' is NOT present in UI".format(element))
            print("INFO: UI status - {}".format(status))
            println("Test will be terminated.")
            raise ValueError("Expected element is not found.")

    def _scan_interpritator(self, settings):
        """ Scan interpritator

        [
            {INITIAL_SCAN_WIZARD.LOCATION : [
                { 'check': "Germany"}, 
            ]},
            {INITIAL_SCAN_WIZARD.DVBC_NETWORKS : [
                { 'select': (NETWORKS_GERMANY_DVBC, 'Unitymedia')},
                { 'press': ["OK"]},
                { 'check': INITIAL_SCAN_WIZARD.START_SCAN},
                { 'press': ["OK"]},
                { 'check': INITIAL_SCAN_WIZARD.START_SCAN},
            ]}
        ]

        Raises: ValueError if unable to get response.
        """
            
        key_function = {
            'select': self.__select,
            'press': self.__navigate,
            'check': self.__check
        }
        println("DEBUG: Start SCAN Interpretator")
        for item in settings:
            for screen, actions in item.items():
                if not self._go_through_wizard(screen):
                    raise ValueError("Expected wizard screen is not found")
                for act in actions:
                    for finction, settings in act.items():
                        result = key_function[finction](settings)
        println("DEBUG: Return result {}".format(result))
        return result

    def _close_scan_wizard(self):
        while not check_all_wizard_closed():
           if not (send_key_with_verification("EXIT") or send_key_with_verification("FWD")):
                println("TV does not react on key pressing")
                return False

        println("All wizards are closed")
        return True


    def _set_settings(self, settings):
        try:
            self._scan_interpritator(settings)
        except ValueError as e:
            println('#ERROR: {}.\nTest will be terminated.'.format(e))
            self._finish_scan()
            return False

        return True

    def _set_presettings(self, settings):
        println("\nSet pre scan settings.")
        return self._set_settings(settings)

    def _set_postsettings(self, settings):
        println("\nSet post scan settings.")
        return self._set_settings(settings)

    def _finish_scan(self):
        result = self._close_scan_wizard()
        finish_test()
        return result

    def _start_scan(self):
        println("No acctions are required to start scan.")
        return True


    def execute_scan(self, scan_settings, timeout, post_settings):  

        self._print_test_decription()

        if not self._reset_to_initial_state():
            return False

        if not self._scan_preparation():
            return False

        if len(scan_settings) > 0:
            if not self._set_presettings(scan_settings):
                return False

        if not self._start_scan(timeout):
            return False

        if len(post_settings) > 0:
            if not self._set_postsettings(post_settings):
                return False

        #if the test reach that point, test result is defined accroding to end function
        #where last verification is done
        return self._finish_scan()
