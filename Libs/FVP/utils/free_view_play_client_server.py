import os
import re
import sys
import shutil
import fileinput
import subprocess
import json
import datetime
from datetime import datetime as dt

from lxml import html
from pathlib import Path

from utils.free_view_play import FVPRequests


def process_user_action(user_action):
    def foo(*args, **kwargs):
        result = user_action(*args, **kwargs)
        assert result['status'] >= 0, result['text']
        return result
    return foo


class FreeViewPlayClientServer():
    def __init__(self, test_log_file, server_log_file, message_box_file,
                 decrypt_test_log_dir):
        self._fvp_object = FVPRequests()

        self.test_log_file = test_log_file
        self.server_log_file = server_log_file
        self.message_box_file = message_box_file
        self.decrypt_test_log_dir = decrypt_test_log_dir
        self.decrypt_test_log_file = None

        self.mds_ip = '192.168.50.1'
        self.tools_dir = os.getenv('TOOLS_DIR')
        self.stream_files = os.getenv('STREAM_FILES').split(';')

        self.decrypt_util_path = Path(self.tools_dir, 'fvp',
                                      'unsign_content_1.2')
        self.python_decrypt_script = Path(self.decrypt_util_path,
                                          'unsign_content.py').as_posix()
        self.decrypt_test_key = Path(self.decrypt_util_path,
                                     'testing_log.key').as_posix()
        self.decrypt_system_key = Path(self.decrypt_util_path,
                                       'system_log.key').as_posix()

        self.resources = (
            'metadata.fvcmd.test', 'ait.fvcmd.test', 'image.fvcmd.test',
            'player.fvcmd.test', 'ctrl.fvcmd.test', '8.8.8.8'
         )

    def deallocate_port(self):
        try:
            cmd = self._fvp_object.deallocate_port()
        except:
            raise

        assert cmd['status'] > 0, cmd['extra_info']

    def allocate_port(self):
        try:
            cmd = self._fvp_object.allocate_port()
        except:
            raise

        assert cmd['status'] > 0, cmd['extra_info']
        return cmd['port']

    def delete_all_with_name(self, name):
        self._fvp_object.delete_all_with_name(name)

    def delete_dut(self):
        self.delete_all_with_name('dut')

    def delete_testrun(self):
        self.delete_all_with_name('testrun')

    def delete_configuration(self):
        self.delete_all_with_name('configuration')

    def delete_runninghistory(self):
        self.delete_all_with_name('runninghistory')

    @process_user_action
    def pressepg(self, dut_name, testrun_name, test_case_id, case_id):
        result = self._fvp_object.user_action(
            dut_name, testrun_name, test_case_id, case_id, 'pressepg'
        )

        return result

    @process_user_action
    def powercycle(self, dut_name, testrun_name, test_case_id, case_id):
        result = self._fvp_object.user_action(
            dut_name, testrun_name, test_case_id, case_id, 'powercycle'
        )

        return result

    @process_user_action
    def standby(self, dut_name, testrun_name, test_case_id, case_id):
        result = self._fvp_object.user_action(
            dut_name, testrun_name, test_case_id, case_id, 'standby'
        )

        return result

    def add_dut(self, name):
        self._fvp_object.add_dut(name)

    def add_testrun(self, name):
        self._fvp_object.add_testrun(name)

    def log_and_message(self, dut_name, testrun_name, test_case_id, case_id):
        self._fvp_object.download_test_log_and_message_box(dut_name,
            testrun_name, test_case_id, case_id, self.test_log_file,
            self.message_box_file
        )

    def start_test(self, dut_name, testrun_name, test_case_id, case_id):
        try:
            result = self._fvp_object.start_test(dut_name, testrun_name,
                                                 test_case_id, case_id)
        except:
            raise

        try:
            assert result['status'] != -1, result['extra_info']
        except:
            raise Exception(result['extra_info'])

    def stop_test(self, dut_name, testrun_name, test_case_id, case_id):
        try:
            result = self._fvp_object.stop_test(dut_name, testrun_name,
                                                test_case_id, case_id)
        except:
            raise

        try:
            assert result['status'] != -1, result['extra_info']
        except:
            raise Exception(result['extra_info'])

    def download_server_log(self):
        self._fvp_object.download_server_log(self.server_log_file)

    def check_environment(self, iface_public, iface_private):
        vbox = True #self.check_vbox_run()
        iface = self.check_inet_interfaces(iface_public, iface_private)
        ping = self.ping_resource()
        return vbox and iface and ping

    def check_vbox_run(self):
        cmd = 'ps ax | grep -e "[vV]irtual[bB]ox --comment .* --startvm"'
        process = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE, shell=True)
        process = process.communicate()[0].decode("utf-8")
        return bool(process)

    def check_inet_interfaces(self, iface_public, iface_private):
        iface_pub = ("ip a show {} up | grep -E "
                     "'inet [0-9]{{1,3}}\.[0-9]{{1,3}}"
                     "\.[0-9]{{1,3}}\.[0-9]{{1,3}}'".format(iface_public))
        iface_priv = ("ip a show {} up | grep -E "
                      "'inet 192\.168\.50\.[0-9]{{1,3}}'".format(iface_private))
        pub_process = subprocess.Popen(iface_pub, stdin=subprocess.PIPE,
                                       stdout=subprocess.PIPE, shell=True)
        pub_process = pub_process.communicate()[0].decode("utf-8")
        priv_process = subprocess.Popen(iface_priv, stdin=subprocess.PIPE,
                                        stdout=subprocess.PIPE, shell=True)
        priv_process = priv_process.communicate()[0].decode("utf-8")
        return bool(pub_process and priv_process)

    def ping_resource(self):
        res = []
        # pattern = re.compile("{}".format(self.mds_ip))
        for resource in self.resources:
            result = subprocess.Popen("ping -c 4 {}".format(resource),
                                      stdout=subprocess.PIPE, shell=True)
            result = result.communicate()[0].decode("utf-8").strip()
            if not result:
                print("Resource %s unavailable or problems with ping command\n" %
                      resource)
                return False

            if '4 packets transmitted, 4 received, 0% packet loss' in result:
                if resource != '8.8.8.8':
                    if self.mds_ip in result:
                        print('Resource %s pinged successfully\n' % resource)
                        res.append('good')
                    else:
                        print(
                            'Some of the packets to %s not get to destination\n'
                            ' Ping FAILED' % resource)
                else:
                    if resource in result:
                        print('Resource %s pinged successfully\n' % resource)
                        res.append('good')

        return len(res) == len(self.resources)

    def decrypt_test_log(self, test_log_file):
        cmd = "{0} {1} -f {2} -k {3} -o {4}".format(
            'python', self.python_decrypt_script, test_log_file,
            self.decrypt_test_key, self.decrypt_test_log_dir
        )

        shutil.rmtree(self.decrypt_test_log_dir, ignore_errors=True)
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                    stdout=subprocess.PIPE, shell=True)
            proc.wait()

            self.decrypt_test_log_file = Path(
                self.decrypt_test_log_dir, Path(
                    test_log_file).name + '_clear_version.json').as_posix()

        except Exception as e:
            print("#Error: %s", str(e))
            return
        return True

    def get_decrypted_file_data(self):
        try:
            with open(self.decrypt_test_log_file) as file:
                data = file.read()
                json_data = json.loads(data)
                return json_data
        except Exception as e:
            print("Error in reading decoded test_file or json problem: %s",
                str(e)
            )
            return

    def check_overall_test_result(self, test_log_file):
        try:
            self.decrypt_test_log(test_log_file)
            json_data = self.get_decrypted_file_data()
        except:
            return

        print('Backend result: %s', json_data['backend_result'])

        res = self.get_warns_errors()
        print('\nWarns, Errors from message box:\n%s', res)

        keys = (item['verdicts'] for item in json_data['activites'])
        warns = (x for x in keys if x != '[]')
        warns = ', '.join(warns)

        print('\nWarns, Errors from test log:\n%s', warns)

        passed = json_data['backend_result'].lower() == 'passed'
        if not passed:
            print('Backend result not equal to "Passed"')

        return passed

    def check_decrypted_log(self, params_dict, test_log_file):
        try:
            self.decrypt_test_log(test_log_file)
            json_data = self.get_decrypted_file_data()
        except:
            return

        requests_list = json_data['activites']

        for x in requests_list:
            union = set(x.items() & set(params_dict.items()))
            if len(union) == len(params_dict):
                print(
                    '\nAll requested parameters are equal to given log parameters'
                )
                return True

        return False

    def check_message_box_results(self, column, message, negate_msg_flag):
        choices = {
            'request_time': 1,
            'request_url': 2,
            'is_from_config': 3,
            'status_code': 4,
            'Errors': 5,
            'Warnings': 6,
            'method': 7,
            'user_agent': 8,
            'response_header': 9,
            'request_headers': 10,
            'expire_time': 11
        }
        try:
            with open(self.message_box_file) as file:
                content = file.read()
                tree = html.fromstring(content)
                output = tree.xpath("//div[@id='innerWrapLeft']"
                                    "/table[@id='activityTable']/"
                                    "tr[@class='row']/td[{}]/text()"
                                    .format(choices[column]))
        except Exception as err:
            print("Failed to get %s due to: %s", column, err)
            return False

        expectation_patt = negate_msg_flag and 'Unexpected' or 'Expected'

        print("Actual message box %s column list: \n%s", column, output)
        print("\n%s message to test is: \n%s", expectation_patt, message)

        escaped_msg = re.escape(message)
        pattern = re.compile(escaped_msg)
        match = any(filter(pattern.search, output))

        if negate_msg_flag:
            return not match

        return match

    def get_warns_errors(self):
        try:
            with open(self.message_box_file) as file:
                content = file.read()
                tree = html.fromstring(content)
                output = tree.xpath("//div[@id='innerWrapLeft']"
                                    "/table[@id='activityTable']/"
                                    "tr[@class='row']/td[5]/text()")
            # XXX: if empty string?
            x = [x for x in output if x != ' ']
            if not x:
                x = "There is no WARNS and ERRORS"

            return x
        except Exception as err:
            print("Failed to get Errors and Warns due: %s", err)
            return False

    def restamp_test_file(self, file, days):
        today = dt.today().date()
        digit_patt = re.compile("[\"\']\d{10}[\"\']")

        for day in range(1, days + 1):
            try:
                self.__restamp_file_for_day(day, today, digit_patt, file)
            except Exception as err:
                print("Can not open a file due to error: %s", err)
                raise

    def __restamp_file_for_day(self, day, today, digit_patt, file):
        with fileinput.input(file, inplace=True) as f:
            for line in f:  # backup='.bak'

                digit_results = digit_patt.findall(line)
                day_patt = re.compile("Day\s?\[?{}\]?".format(day))
                negative_day_patt = re.compile("Day\s?\[?-{}\]?".format(day))
                without_day_patt = re.compile("[dD]ay")

                if digit_results and negative_day_patt.search(line):
                    line = self.__restamp_line(today, day, digit_results, line,
                                               backward=True)

                elif digit_results and day_patt.search(line):
                    line = self.__restamp_line(today, day, digit_results, line)
                
                elif digit_results and not without_day_patt.search(line):
                    line = self.__restamp_line(today, day, digit_results, line)

                sys.stdout.write(line)

    def __restamp_line(self, today, day, digit_results, line, backward=False):
        try:
            for digit_result in digit_results:
                digit_result = digit_result[1:-1]
                extracted_time = dt.utcfromtimestamp(int(digit_result)).time()
                if extracted_time == datetime.time(hour=0, minute=0, second=0):
                    replace_value = "DNC"
                else:
                    if backward:
                        new_date_time = dt.combine(
                            today - datetime.timedelta(days=day),
                            extracted_time
                        )    
                    else:
                        new_date_time = dt.combine(
                            today + datetime.timedelta(days=day - 1),
                            extracted_time
                        )
                    # Need 3 hour shifting because of impossible transparent conversion
                    # from UTC(+0) to timestamp(Moscow zone +3)
                    # This part of code does not work
                    # ###timestamp = new_date_time.replace(tzinfo=timezone.utc).timestamp()
                    new_date_time = new_date_time + datetime.timedelta(hours=3)
                    new_date_time_unix = int(new_date_time.timestamp())
                    replace_value = new_date_time_unix
                line = line.replace(str(digit_result), str(replace_value))
        except Exception as err:
            print("Can not perform unix time conversion due to error: %s", err)
            raise
        return line

    def playback_offset_time_func(self):
        now = dt.now()
        sec_since_midnight = (now - now.replace(hour=0, minute=0, second=0,
                                                microsecond=0)).seconds
        return sec_since_midnight

    def lstr_offset(self):
        playback_offset_time = self.playback_offset_time_func()
        patt = re.compile("playback_offset.*")
        for file in self.stream_files:
            with fileinput.input(file, inplace=True) as f:
                for line in f:
                    result = patt.findall(line)
                    if result:
                        line = 'playback_offset={}\n'.format(playback_offset_time)
                    sys.stdout.write(line)
