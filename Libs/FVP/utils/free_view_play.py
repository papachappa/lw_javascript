#!/usr/bin/env python3
import re

import requests


class FVPRequests():
    def __init__(self, username='admin', password='admin'):
        self.__login_url = 'http://ctrl.fvcmd.test/admin/login/'
        self.__index_url = 'http://ctrl.fvcmd.test/index/'
        self.__allocate_port_url = 'http://ctrl.fvcmd.test/port/request/'
        self.__deallocate_port_url = 'http://ctrl.fvcmd.test/port/close/'

        self.__dut_url = 'http://ctrl.fvcmd.test/admin/datamodels/dut/'
        self.__add_dut_url = 'http://ctrl.fvcmd.test/admin/datamodels/dut/add/'

        self.__testrun_url = 'http://ctrl.fvcmd.test/admin/datamodels/testrun/'
        self.__add_testrun_url = 'http://ctrl.fvcmd.test/admin/datamodels/testrun/add/'

        self.__config_url = 'http://ctrl.fvcmd.test/admin/datamodels/configuration/'
        self.__running_history_url = 'http://ctrl.fvcmd.test/admin/datamodels/runninghistory/'

        self.__test_url_f = 'http://ctrl.fvcmd.test/{testcase_id}/case/{case_id}/dut/{dut}/testrun/{testrun_id}/'
        self.__test_url_actions_f = self.__test_url_f + 'actions/{action}'

        self.__server_log_url = 'http://ctrl.fvcmd.test/server/log/'

        self.__username = username
        self.__password = password

        self.session = requests.session()
        self.session.get(self.__login_url)
        login_data = {
            'username': self.__username,
            'password': self.__password,
            'csrfmiddlewaretoken': self.session.cookies['csrftoken']
        }
        self.session.post(self.__login_url, data={**login_data, 'next': '/admin/'})

        self.__csrftoken = self.session.cookies['csrftoken']

    def allocate_port(self, user_email='arogudeev@luxoft.com'):
        params = {'data': user_email}
        r = self.session.post(
            self.__allocate_port_url, params=params,
            data={'csrfmiddlewaretoken': self.__csrftoken},
        )

        r.raise_for_status()
        return r.json()

    def deallocate_port(self):
        r = self.session.post(self.__deallocate_port_url, data={'csrfmiddlewaretoken': self.__csrftoken},)

        r.raise_for_status()
        return r.json()

    def add_dut(self, dutid, model='Unspecified', hardware_version='Unspecified',
                software_version='Unspecified', company='Unspecified', spec_version='1.1.1'):
        """
            Can rise 403
        """
        params = {
            'dutid': dutid,
            'model': model,
            'hardware_version': hardware_version,
            'software_version': software_version,
            'company': company,
            'spec_version': spec_version,
            'submit': 'Save',
        }
        r = self.session.post(self.__add_dut_url, data={'csrfmiddlewaretoken': self.__csrftoken, **params})

        r.raise_for_status()

    def __get_elements_ids(self, url, name):
        r = self.session.get(url)
        r.raise_for_status()

        pattern = re.compile("href=\"/admin/datamodels/{0}/([0-9]+)/\"".format(name))
        id_ = pattern.findall(r.text)

        return id_

    def delete_all_with_name(self, name):
        """
            Can rise 403
        """
        urls = {
            'dut': self.__dut_url,
            'testrun': self.__testrun_url,
            'configuration': self.__config_url,
            'runninghistory': self.__running_history_url,
        }

        try:
            url = urls[name]
        except:
            # XXX
            raise Exception('Unnavailable blag')

        ids = self.__get_elements_ids(url, name)
        if not ids:
            # elements to delete not found
            return

        params = {
            'action': 'delete_selected',
            'post': 'yes',
            '_selected_action': ids,
        }
        r = self.session.post(url, data={'csrfmiddlewaretoken': self.__csrftoken, **params})

        r.raise_for_status()

    def add_testrun(self, name):
        """
            Can rise 403
        """
        params = {
            'name': name,
            'submit': 'Save',
        }
        r = self.session.post(self.__add_testrun_url, data={'csrfmiddlewaretoken': self.__csrftoken, **params})

        r.raise_for_status()

    def start_test(self, dut, testrun_id, testcase_id, case_id):
        params = {
            'dut': dut,
            'testrun_id': testrun_id,
            'testcase_id': testcase_id,
            'case_id': case_id,
        }
        r = self.session.get(self.__test_url_actions_f.format(**params, action='start'))

        r.raise_for_status()
        return r.json()

    def stop_test(self, dut, testrun_id, testcase_id, case_id):
        params = {
            'dut': dut,
            'testrun_id': testrun_id,
            'testcase_id': testcase_id,
            'case_id': case_id,
        }
        r = self.session.get(self.__test_url_actions_f.format(**params, action='end'))

        r.raise_for_status()

        return r.json()

    def __download_file(self, filename, url):
        r = self.session.get(url, stream=True)

        r.raise_for_status()

        with open(filename, 'wb') as fd:
            for chunk in r.iter_content(chunk_size=128):
                fd.write(chunk)

    def __download_log(self, params, fname):
        url_log = self.__test_url_f.format(**params) + 'logs/'
        self.__download_file(fname, url_log)

    def __download_message_box(self, params, fname):
        url_mbox = self.__test_url_f.format(**params) + 'messages/'
        self.__download_file(fname, url_mbox)

    def download_test_log_and_message_box(self, dut, testrun_id, testcase_id, case_id,
            log_fname, mbox_fname):
        params = {
            'dut': dut,
            'testrun_id': testrun_id,
            'testcase_id': testcase_id,
            'case_id': case_id,
        }
        self.__download_log(params, log_fname)
        self.__download_message_box(params, mbox_fname)

    def download_server_log(self, filename):
        self.__download_file(filename, self.__server_log_url)

    def user_action(self, dut, testrun_id, testcase_id, case_id, action):
        params = {
            'dut': dut,
            'testrun_id': testrun_id,
            'testcase_id': testcase_id,
            'case_id': case_id,
            'action': action,
        }
        r = self.session.get(self.__test_url_actions_f.format(**params))

        r.raise_for_status()
        return r.json()


if __name__ == '__main__':
    import time

    dut_name = "_DUT_URL_123"
    testrun_name = "TEST_RUN_JOPA"
    test_case_id = "MDS_901"
    case_id = "0"

    o = FVPRequests()
    r = o.deallocate_port()
    print(r)
    r = o.allocate_port()
    print(r)

    o.delete_all_with_name('dut')
    o.delete_all_with_name('testrun')
    o.delete_all_with_name('configuration')
    o.delete_all_with_name('runninghistory')

    o.add_testrun(testrun_name)
    o.add_dut(dut_name)
    o.add_dut('_DUT_URL_345')
    o.add_dut('_DUT_URL_567')

    qparams = {
        "dut":  dut_name,
        "testrun_id": testrun_name,
        "testcase_id": test_case_id,
        "case_id": case_id,
    }
    result = o.start_test(**qparams)
    print(result)
    time.sleep(2)

    result = o.user_action(action='powercycle', **qparams)
    print(result)
    time.sleep(1)

    result = o.user_action(action='pressepg', **qparams)
    print(result)
    time.sleep(1)

    result = o.user_action(action='standby', **qparams)
    print(result)
    time.sleep(1)

    result = o.stop_test(**qparams)
    print(result)
    
    o.download_test_log_and_message_box(log_fname='/tmp/log', mbox_fname='/tmp/mbox', **qparams)
