import re
import sys
import telnetlib
import select
import argparse
import time

def parseCamLog(included=None, excluded=None, CAMaddress='192.168.0.46', \
                CAMport=23):
    try:
        CAMclient = telnetlib.Telnet(CAMaddress, CAMport, 20)
        print('Connection to CAM is successful.')
    except Exception as e:
        print('#ERROR: Connection to CAM was not established.\n Reason: ', e)
        return False
    print('----- CAM output -----')
    camLog = ""
    while 1:
        rfd, wfd, xfd = select.select([CAMclient], [], [], 20)
        if CAMclient in rfd:
            try:
                #text = CAMclient.read_until(b"\r\n")
                time.sleep(0.05)
                text = CAMclient.read_very_eager()
            except EOFError:
                print('-------EOFERROR-------')
                break
            if text:
                print(text.decode("utf-8", "ignore")[:-1])
                camLog += text.decode("utf-8", "ignore")
        else:
            print('----------------------')
            break

    if camLog:
        camLog = re.sub( ' +' , ' ', re.sub('[\r\n]', ' ', camLog))
        cam_re = re.compile( \
            ' ?\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}.\d{1}\s\(TDT Time.+?Internal Time\)')
        camLog = re.sub(cam_re, "", camLog)
        time.sleep(5)
        testResult = True
        if not included == None:
            errors = []
            matches = []
            line = 0
            logLen = len(camLog)-1
            for x in included:
                pattern1 = re.sub("\[", "\[", x)
                pattern2 = re.sub("\]", "\]", pattern1)
                pattern3 = re.sub("\?", "\?", pattern2)
                pattern4 = re.sub("\%", "\%", pattern3)
                pattern5 = re.sub("\)", "\)", pattern4)
                pattern6 = re.sub("\(", "\(", pattern5)
                pattern = re.sub("@", "[1-9]?\d{1,2}", pattern6)
                matches = re.findall(pattern, camLog)
                if matches:
                    try: 
                        i = camLog.index(matches[0], line, logLen)
                        line = i+1                    
                    except ValueError:
                        errors.append(x)                    
                else:
                    errors.append(x)
            if errors:
                print("#VERIFICATION FAILED: Next strings from expected " 
                        "sequence are not found in the log:" )
                for x in errors:
                    print("\t --", x)
                testResult = False
            else:
                print("#VERIFICATION PASSED: All expected strings are "
                      "present in the log.")

        if not excluded == None:
            errors = [x for x in excluded if x in camLog]
            if errors:
                print("#VERIFICATION FAILED: Next unexpected strings are "
                          "found in the log:" )
                for x in errors:
                    print("\t --", x)
                testResult = False
            else:
                print("#VERIFICATION PASSED: All not expected strings are "
                      "absent in the log.")
        return testResult
    else:
        print("WARN: CAM output is empty")
        return False
