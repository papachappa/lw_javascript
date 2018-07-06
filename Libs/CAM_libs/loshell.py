from interface import RequestAccess, Loshell
from ficom import connectFi

def loshell(host, cmd):
    print ("Sending request to %s" %host)
    try:
        clientId = connectFi(host)
    except Exception as e:
        print ('#ERROR:', e)
        raise e

    print ("Sending command '{0}' to {1}".format(cmd, host))
    loshellRequest = Loshell(host, clientId, cmd)
    res = loshellRequest.getResponse()
    if res == 'ok':
        print ("Command '%s' sent successfully" %cmd)
        return True
    else:
        print ("#ERROR: Sending of command '%s' failed" %cmd)
        return False

