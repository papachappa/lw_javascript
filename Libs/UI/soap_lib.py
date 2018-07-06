import xml.dom.minidom as dom
from soap_modules.soap import HttpSoapRequest
import traceback
import argparse
import sys


class GuiSoapInterfaceRequest(HttpSoapRequest):
    """ Base class for gui soap interface request. """

    def __init__(self, host):
        """ Create a gui soap interface request with defined settings. """
        super().__init__(host, 47110, "", "urn:GUI2012")

    def _buildQuery(self, doc, parentTag, headTag, bodyTag, tagValue):
        head_tag = doc.createElement(headTag)
        body_tag = doc.createElement(bodyTag)
        tag_value = doc.createTextNode(tagValue)
        body_tag.appendChild(tag_value)
        head_tag.appendChild(body_tag)

        return head_tag

class GetGuiStatus(GuiSoapInterfaceRequest):
    def __init__(self, host):
        super().__init__(host)

    def _getAction(self):
        return "GetStatus"

    def _fillSoapBody(self, doc):
        tag = self._buildQuery(doc, doc.getElementsByTagName("soapenv:Body"), "urn:GetStatus", "urn:aRequest", "GuiStatus")
        return tag

    def _parseResponse(self, data):
        doc = None
        try:
            doc = dom.parseString("".join(map(chr,[x for x in data if x is not 0xad])))
            tag = doc.getElementsByTagName('m:aResult')[0]
            return tag.firstChild.nodeValue
        except Exception as e:
            traceback.print_exc()
            return "ERROR while parsing response"

class SendKey(GuiSoapInterfaceRequest):
    def __init__(self, host, keycode):
        self.keycode = keycode
        super().__init__(host)

    def _getAction(self):
        return "SendKey"

    def _fillSoapBody(self, doc):
        tag = self._buildQuery(doc, doc.getElementsByTagName("soapenv:Body"), "urn:SendKey", "urn:aKeyCode", self.keycode)
        return tag

    def _parseResponse(self, data):
        doc = None
        try:
            doc = dom.parseString("".join(map(chr,[x for x in data if x is not 0xad])))
            tag = doc.getElementsByTagName('m:aResult')[0]
            return tag.firstChild.nodeValue
        except Exception as e:
            traceback.print_exc()
            return "ERROR while parsing response"

"""
if __name__ == '__main__':
    input_parser = argparse.ArgumentParser()
    input_parser.add_argument("TV_IP", help="TV set IP")
    args = input_parser.parse_args()
    print("Sending request to %s" % args.TV_IP)

    try:
        guiStatus = GetGuiStatus(args.TV_IP).getResponse()        
        keyResponse = SendKey(args.TV_IP, "TI-KEY-EVENT-UP").getResponse()
    except Exception as e:
        print("TV set %s is not available" % args.TV_IP)
        sys.exit(1)
    print("GUI Status %s is available" % guiStatus)
    print("Key reponse %s is available" % keyResponse)

"""
