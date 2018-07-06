import re

def parseCamLog(included=None, excluded=None, camLog='/tmp/cam_log'):
    try:
        f = open(camLog, 'r')
    except IOError:
        print("#ERROR: Failed to open CAM log: /tmp/cam_log")

    with open(camLog) as f:
        for line in f:
            line = line.strip()
            line = re.sub( ' +' , ' ', re.sub('[\r\n]', '', line))
            line = re.sub( ' +' , ' ', re.sub('[\n]', '', line))
            cam_re = re.compile( \
                    ' ?\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}.\d{1}\s\(TDT Time.+?Internal Time\)')
            line = re.sub(cam_re, "", line)
            camLog = camLog + line
    print('----- CAM output -----')
    print(camLog)
    print('----------------------')

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
            print('#VERIFICATION PASSED: All expected strings are '
                  'present in the log.')

    if not excluded == None:
        errors = [x for x in excluded if x in camLog]
        if errors:
            print("#VERIFICATION FAILED: Next unexpected strings are "
                      "found in the log:" )
            for x in errors:
                print("\t --", x)
            testResult = False
        else:
            print('#VERIFICATION PASSED: All not expected strings are '
                  'absent in the log.')
    return testResult
        
