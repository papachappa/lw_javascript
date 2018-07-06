from telnetlib import Telnet
from select import select
from time import sleep

try:
    CAMclient = Telnet('192.168.0.46', 23, 20)
    connected = True
    print('Connection to CAM is successful')
except Exception as e:
    connected = False
    print('#ERROR: Connection to CAM was not established.\n Reason: ', e)

if connected:
    print('----- CAM output -----')
    
    while 1:
        rfd, wfd, xfd = select([CAMclient], [], [], 10)
        if CAMclient in rfd:
            try:
                #text = CAMclient.read_until(b"\r\n")
                sleep(0.05)
                text = CAMclient.read_very_eager()
                print(text.decode("utf-8", "ignore")[:-1])
            except EOFError:
                print('-------EOFERROR-------')
                break
        else:
            print('----------------------')
            break
