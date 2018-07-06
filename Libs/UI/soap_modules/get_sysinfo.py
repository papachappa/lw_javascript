#!/usr/bin/env python3

from soap_modules.interface import GetSystemInfo
from soap_modules.ficom import connectFi

import sys, errno
import argparse

def getInfo(host):
    print("Sending request to %s" %host)
    try:
        clientId = connectFi(host)
    except Exception as e:
        print('ERROR:', e)
        raise e

    print("Getting system information")
    sysInfoRequest = GetSystemInfo(host, clientId)
    return sysInfoRequest.getResponse()


if __name__ == '__main__':
    input_parser = argparse.ArgumentParser()
    input_parser.add_argument("TV_IP", help="TV set IP")
    args = input_parser.parse_args()
    exclude = ['EaromVersion', 'TunerChannel1', 'ArticleNr', 'SerialNr', 'MAC',
               'ChassisName', 'ProductSerialNumber', 'TunerChannel2',
               'CredentialsInstalled'];
    try:
        sysInfo = getInfo(args.TV_IP)
    except Exception:
        print("ERROR: System info is not available")
        sys.exit(1)

    print('\nCurrent system information:')
    for k, v in sysInfo.items():
        if k not in exclude:
            print("%s: %s" % (k, v))

