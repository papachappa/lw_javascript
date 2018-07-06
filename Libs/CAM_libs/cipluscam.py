import re
import os
import socket
from urllib.parse import urlparse

class CiPlusCam(object):

    def __init__(self, uri='telnet://192.168.0.46:23'):
        parsedUri = urlparse(uri)
        self.__ip, self.__port = parsedUri.netloc.split(':')
        self.__port = int(self.__port)
        self.__socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def __del__(self):
        self.__socket.close()

    def reset(self):
        self.__socket.close()
        self.__socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def connect(self, timeout=5):
        self.__socket.settimeout(timeout)
        self.__socket.connect((self.__ip, self.__port))

    def disconnect(self):
        self.__socket.close()

    def sendEmptyLine(self):
        self.__sendString('\r')
        self.__receiveString('Ready> ')

    def launchScript(self, script):
        msg = 'AD_START_SCRIPT \r'
        file = open(script, 'r')
        msg = msg + file.read() + '\0'
        file.close()
        self.__sendString(msg)
        return self.__receiveString('Script is finished.\r\n')

    def __sendString(self, string):
        self.__socket.sendall(string.encode('utf-8'))

    def __receiveString(self, endToken):
        msg = ''
        while 1:
            try:
                data = self.__socket.recv(1)
                if data == '':
                    raise RuntimeError('socket connection broken')
                msg = msg + data.decode('utf-8')
                if len(msg) >= len(endToken):
                    if msg[-1*len(endToken):] == endToken:
                        break
            except UnicodeDecodeError:
                pass

        return msg

    def __repr__(self):
        """
        Return an unambigious representation of this object.
        """
        return 'ip: {}, port: {}'.format(self.__ip, self.__port)

    def checkResponse(self, camLog, included, excluded=None):
        camLog = re.sub( ' +' , ' ', re.sub('[\r\n]', ' ', camLog))
        cam_re = re.compile( \
            ' ?\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}.\d{1}\s\(TDT Time.+?Internal Time\)')
        camLog = re.sub(cam_re, "", camLog)
        testResult = True
        errors = []
        matches = []
        line = 0
        logLen = len(camLog)-1
        for x in included:
            patern1 = re.sub("\[", "\[", x)
            patern2 = re.sub("\]", "\]", patern1)
            patern3 = re.sub("\?", "\?", patern2)
            patern4 = re.sub("\%", "\%", patern3)
            patern5 = re.sub("\)", "\)", patern4)
            patern6 = re.sub("\(", "\(", patern5)
            patern = re.sub("@", "[1-9]?\d{1,2}", patern6)
            matches = re.findall(patern, camLog)
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

