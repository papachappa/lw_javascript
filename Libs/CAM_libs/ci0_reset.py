from loshell import loshell
from aux_functions import checkConnect
#import argparse
import sys, errno
import os
tv_ip = os.getenv('TV_IP')

if __name__ == '__main__':
    #input_parser = argparse.ArgumentParser()
    #input_parser.add_argument("TV_IP",
    #                          help="TV set IP")
    #args = input_parser.parse_args()

    try:
        cmdResult = loshell(tv_ip, 'cireset 0')
    except Exception as e:
        print ("#ERROR:", e)
        print ('Test result: TEST_FAILED')
        sys.exit(errno.ECONNREFUSED)

    if cmdResult:
        print('INFO: Command to reset CAM is sent successfully.')
    else:
        print('#VERIFICATION FAILED: There is no successful response'
              ' from TV.')
        print ('Test result: TEST_FAILED')
        sys.exit(1)

    testResult = True
    CAMstop = checkConnect(5)
    if CAMstop:
        print('#VERIFICATION FAILED: CI module was not shut down during'
              ' 5 sec.')
        testResult = False
    else:
        print('#VERIFICATION PASSED: CI module shut down.')
        
    CAMstart = checkConnect(180)
    if CAMstart:
        print('#VERIFICATION PASSED: CI module started.')
    else:
        print('#VERIFICATION FAILED: CI module was not started during'
              ' 3 min.')
        testResult = False    
    
    if testResult:
        print('Test result: TEST_PASSED')
    else:
        print('Test result: TEST_FAILED')
