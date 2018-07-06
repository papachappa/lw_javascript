#!/usr/bin/env python3

try:
    from utils.soap_commands.soap_modules.interface import GetSystemInfo
    from utils.soap_commands.soap_modules.ficom import connectFi
except ImportError:
    from soap_modules.interface import GetSystemInfo
    from soap_modules.ficom import connectFi

import sys, errno
import argparse

def getInfo(host):
    try:
        clientId = connectFi(host)
    except:
        raise
    sysInfoRequest = GetSystemInfo(host, clientId)
    return sysInfoRequest.getResponse()


if __name__ == '__main__':
    input_parser = argparse.ArgumentParser()
    input_parser.add_argument("TV_IP", help="TV set IP")
    args = input_parser.parse_args()

    try:
        sysInfo = getInfo(args.TV_IP)
    except Exception as ex:
        print('ERROR:', ex)
        sys.exit(1)

    print(sysInfo['ChassisName'])
    

