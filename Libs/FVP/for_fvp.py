import os

from pathlib import Path

from utils.free_view_play_client_server import FreeViewPlayClientServer


class ControllerFreeViewPlayClient():
    def __init__(self):
        try:
            test_log_dir = os.getenv('LOGDIR_PATH')
            self.test_log_file = Path(test_log_dir, 'fvp.log').as_posix()
            self.server_log_file = Path(test_log_dir, 'fvp_server.log').as_posix()
            self.message_box_file = Path(test_log_dir, 'messagebox_file.html').as_posix()
            self.decrypt_test_log_dir = Path(test_log_dir, 'decrypt_test_log').as_posix()

            self._fvp_client = FreeViewPlayClientServer(
                self.test_log_file,
                self.server_log_file,
                self.message_box_file,
                self.decrypt_test_log_dir,
            )
        except Exception as e:
            print("Error occurred: %s " % e)

    def _port_deallocation(self, **kwargs):
        try:
            self._fvp_client.deallocate_port()
        except Exception as e:
            print("Port deallocation FAILED")
            print(e)
            raise

    def _port_allocation(self, **kwargs):
        try:
            port = self._fvp_client.allocate_port()
        except Exception as e:
            print("Port allocation FAILED")
            print(e)
            raise
        else:
            return port

    def _delete_dut(self, **kwargs):
        self._fvp_client.delete_dut()

    def _delete_testrun(self, **kwargs):
        self._fvp_client.delete_testrun()

    def _delete_configuration(self, **kwargs):
        self._fvp_client.delete_configuration()

    def _delete_runninghistory(self, **kwargs):
        self._fvp_client.delete_runninghistory()

    def _delete_all(self, **kwargs):
        self._delete_dut()
        self._delete_testrun()
        self._delete_configuration()
        self._delete_runninghistory()

    def _pressepg(self, dut_name, testrun_name, test_case_id, case_id, **kwargs):
        self._fvp_client.pressepg(dut_name, testrun_name, test_case_id, case_id)

    def _powercycle(self, dut_name, testrun_name, test_case_id, case_id, **kwargs):
        self._fvp_client.powercycle(dut_name, testrun_name, test_case_id, case_id)

    def _standby(self, dut_name, testrun_name, test_case_id, case_id, **kwargs):
        self._fvp_client.standby(dut_name, testrun_name, test_case_id, case_id)

    def _add_dut(self, name, **kwargs):
        self._fvp_client.add_dut(name)

    def _add_testrun(self, name, **kwargs):
        self._fvp_client.add_testrun(name)

    def _log_and_message(self, dut_name, testrun_name, test_case_id, case_id, **kwargs):
        self._fvp_client.log_and_message(dut_name, testrun_name, test_case_id, case_id)

    def _stop_test(self, dut_name, testrun_name, test_case_id, case_id, **kwargs):
        try:
            self._fvp_client.stop_test(dut_name, testrun_name, test_case_id, case_id)
        except Exception as e:
            print('Failed to stop the test test due to: \n%s', str(e))
            raise

    def _start_test(self, dut_name, testrun_name, test_case_id, case_id, **kwargs):
        try:
            self._fvp_client.start_test(dut_name, testrun_name, test_case_id, case_id)
        except Exception as e:
            print('Failed to start the test test due to: \n%s', str(e))
            raise

    def _server_log(self, **kwargs):
        self._fvp_client.download_server_log()

    def check_env(self, iface_pub, iface_priv, **kwargs):
        result = self._fvp_client.check_environment(iface_pub, iface_priv)
        if result:
            print('\nTest environment correct and running')
        else:
            print('\nTest environment not correct or not running')

        return result

    def check_test_log_result(self, **kwargs):
        result = self._fvp_client.check_overall_test_result(self.test_log_file)

        if result:
            print('\nBackend test passed.')
        else:
            print('\nBackend test failed.')

        return result

    def check_message_box_res(self, column, message, negate_msg_flag=False, **kwargs):
        result = self._fvp_client.check_message_box_results(column, message, negate_msg_flag)

        return result

    def __restamp_file(self, file_name, days):
        try:
            self._fvp_client.restamp_test_file(file_name, days)
        except:
            print('Failed to restamp file "%s".', file_name)
            raise
        else:
            print('Test file "%s" restamped', file_name)

    def restamp_files(self, file, days, **kwargs):
        result = False

        try:
            for file_name in file:
                self.__restamp_file(file_name, days)
        except Exception as err:
            print('error occurs: %s', err)
        else:
            result = True

        if result:
            print('All files restamped.')

        return result

    def lstr_play_offset(self):
        result = False
        try:
            self._fvp_client.lstr_offset()
        except:
            print('Failed to change lstreamer offset '
                              'time in fvp ini files')
            
        else:
            print('FVP stream ini file(s) have been '
                             'successfully offset')
            result = True
        return result

    def check_decrypted_log(self, params):
        result = self._fvp_client.check_decrypted_log(params, self.test_log_file)
        return result

    def _run_request_command(self, command, **kwargs):
        choices = {
            'pressepg': self._pressepg,
            'powercycle': self._powercycle,
            'standby': self._standby,
            'stop_test': self._stop_test,
            'delete_dut': self._delete_dut,
            'delete_testrun': self._delete_testrun,
            'delete_configuration': self._delete_configuration,
            'delete_runninghistory': self._delete_runninghistory,
            'add_dut': self._add_dut,
            'add_testrun': self._add_testrun,
            'start_test': self._start_test,
            'log_and_message': self._log_and_message,
            'server_log': self._server_log,
            'deallocate_port': self._port_deallocation,
            'allocate_port': self._port_allocation,
            'delete_all': self._delete_all
        }

        try:
            function = choices[command]
        except (Exception, KeyError) as err:
            print('\nRequest failed due: %s', err)
            raise
        else:
            function(**kwargs)

    def execute_test(self, kwargs):
        command = kwargs.pop('command')
        choices = {
            'check_environment': self.check_env,
            'check_test_log_result': self.check_test_log_result,
            'check_message_box_results': self.check_message_box_res,
            'restamp_test_file': self.restamp_files,
            'lstreamer_playback_offset': self.lstr_play_offset,
            'check_decrypted_log': self.check_decrypted_log,
        }

        try:
            function = choices[command]
        except KeyError:
            try:
                self._run_request_command(command, **kwargs)
            except Exception as e:
                print('Error occurred: %s' % e)
                result = False
            else:
                result = True
        else:
            try:
                result = function(**kwargs)
            except Exception as e:
                print('Error occurred: %s' % e)
                result = False
        if result:
            print('\nTest result: TEST_PASSED\n')
        else:
            print('\nTest result: TEST_FAILED\n')

        return result
