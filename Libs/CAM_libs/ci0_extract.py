import sys, errno
#import argparse
from loshell import loshell
import sys, errno
import os
tv_ip = os.getenv('TV_IP')

if __name__ == '__main__':
    #input_parser = argparse.ArgumentParser()
    #input_parser.add_argument("TV_IP",
    #                          help="TV set IP")
    #args = input_parser.parse_args()

    try:
        cmdResult = loshell(tv_ip, 'ciextract 0')
    except Exception as e:
        print ("#ERROR:", e)
        print ('Test result: TEST_FAILED')
        sys.exit(errno.ECONNREFUSED)

    if cmdResult:
        print('#VERIFICATION PASSED: Command to extract CAM is sent successfully.')
        print('Test result: TEST_PASSED')
    else:
        print('#VERIFICATION FAILED: There is no successful response'
                  ' from TV.')
        print('Test result: TEST_FAILED')


