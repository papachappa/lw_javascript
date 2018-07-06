#from enum import Enum

class MAIN_MENU():
    """list of items of main menu"""
    SYSTEM_SETTINGS = "System settings"

class SYSTEM_SETTINGS_MENU():
    """list of items of system settings menu"""
    EXTRAS = "Extras"
    STATIONS_MENU = "Stations"

class STATIONS_MENU():
    AUTO_SCAN = "Automatic scan TV+Radio"

class EXTRAS_MENU():
    """list of items of menu 'extras' """
    INITIAL_SCAN = "Repeat initial installation"

class FRONTEND():
    SEARCH_CAM_SCREEN = "#Dashboard| #Button|text:Immediately| #ActionField"


DCM_OPTIONS = {
    'rows': 1,
    'elements': (
        'Immediately',
        'Later'
    )
}


class CAM_SCAN_WIZARD():
    """enumerators for screen titles of cam scan wizard"""
    SIGNAL_SOURCE = "Title:Signal source(s) for CA module" # check title:DVB-S
    SELECT_SATELLITE_INSTALLATION = "Title:Select satellite installation"
    SELECT_SATELLITES = "Title:Select satellites" #Eutelsat 5 West A 5°W
    BAND = "Title:Dual/single band (Eutelsat 5 West A 5°W)" 
    LNB_FREQ = "Title:LNB frequencies"
    STATIONS_SEARCH = "Title:Station sorting"
    STATIONS_SORTING = "Title:Station sorting"
    SCAN_RESULT = "Title:Station Search"


LNB_FREQ_LOW = {
    'rows': 1,
    'elements': (
        '9750 MHz',
        '10000 MHz',
        '10200 MHz',
        '10600 MHz'
    )
}

LNB_FREQ_HIGH = {
    'rows': 1,
    'elements': (
        '10600 MHz',
        '10750 MHz',
        '11000 MHz',
        '11250 MHz'
    )
}



class INTERACTIVE_DCM_SCAN_WIZARD():
    """enumerators for screen titles of auto scan wizard"""
    SCAN = "Title:Station Search"
    SCAN_RESULT = "Title:Search result"
    NEW_TV_SERVICES = "Title:Newly found stations (TV)"  #Title:Newly found stations (TV)
    NEW_RADIO_SERVICES = "Title:Newly found stations (Radio)|Hint text" 
    NO_FOUND_TV_SERVICES = "Title:Stations no longer found (TV)"
    NO_FOUND_RADIO_SERVICES = "Title:Stations no longer found (Radio)"


class NIGHT_DCM_SCAN_WIZARD():
    """enumerators for screen titles of auto scan wizard"""
    SCAN = "Title:Station Search (DVB-T)"
    NEW_TV_SERVICES = "Title:Newly found stations (TV)"  #Title:Newly found stations (TV)
    NEW_RADIO_SERVICES = "Title:Newly found stations (Radio)" 


class AUTO_SCAN_WIZARD():
    """enumerators for screen titles of auto scan wizard"""
    FIRST_SCREEN = "Title:SEARCH WIZARD - Check search settings"
    SIGNAL_SOURCE= "Title:Signal source"
    DVBC_NETWORKS = "Title:Network selection (DVB-C)"
    DVBS_NETWORKS = "Title:Network selection (ASTRA1 19,2°E)"
    DVBS_SETTINGS_ASTRA = "Title:DVB-S settings (ASTRA1 19,2°E)"
    SCAN = "Title:Station Search"
    SCAN_RESULT = "Title:Search result"
    NEW_TV_SERVICES = "Title:Newly found stations (TV)"
    NEW_RADIO_SERVICES = "Title:Newly found stations (Radio)|Hint text"
    NO_FOUND_TV_SERVICES = "Title:Stations no longer found (TV)"
    NO_FOUND_RADIO_SERVICES = "Title:Stations no longer found (Radio)"


START_AUTO_SCAN = {
    'rows': 1,
    'elements': (
        'Change search settings',
        'Start search/update'
    )
}


SCRAMBLED_STATIONS = {
    'rows': 1,
    'elements': (
        'no',
        'yes'
    )
}


SYMBOL_RATE = {
    'rows': 1,
    'elements': (
        '22000'
    )
}




class INITIAL_SCAN_WIZARD():
    """enumerators for screen titles of initial scan wizard"""
    FIRST_SCREEN = "Title:Repeat initial installation"
    MENU_LANGUAGE = "Title:INITIAL INSTALLATION - Menu language"
    LICENCE = "Title:Licence agreement"
    ENERGY_MODE = "Title:Energy efficiency"
    LOCATION = "Title:Location of TV set"
    CABLES = "Title:Connect antenna cable(s)"
    IPTV_NETWORKS = "Title:Network selection (IPTV)"
    INTERNET_SECURITY = "Title:Internet Security hint"
    IPTV_MODE = "Title:Select network mode"
    IP_SETTINGS = "Title:IP configuration"
    IPTV_NETWORK_STATUS = "Title:Network status"
    DVBT_NETWORKS = "Title:Network selection (DVB-T)"
    DVBT_SETTINGS = "Title:DVB-T settings"
    DVBC_NETWORKS = "Title:Network selection (DVB-C)"
    DVBC_SETTINGS = "Title:DVB-C settings"
    DVBS_NETWORKS = "Title:Network selection (DVB-S)"
    DVBS_SATELLITES_CONFIGURATION = "Title:Select satellite installation"
    DVBS_SATELLITES = "Title:Select satellites"
    DVBS_BAND = "Title:Dual/single band"
    DVBS_SIGNAL_DETECTION ="Satellite (DVB-S/S2)"
    DVBS_SETTINGS = "Title:DVB-S settings"
    START_SCAN = "Title:Check search settings"
    SCAN = "Title:Station Search"
    SCAN_RESULT = "Title:Search result"
    AGE_LOCK = "Title:Age-related lock"
    NETWORK_CONFIGURATION = "Title:Network configuration"
    INFORM_ABOUT_NEW_SOFTWARE = "Title:Inform about new software"
    PARENTAL_LOCK = "Title:Parental lock"


INITIAL_SCAN_SATELLITES ={
    'rows': 7,
    'elements': (
        'Optus D1 160°E',
        'Türksat 42°E',
        'Hellas Sat2 39°E',
        'Eutelsat 36A 36°E',
        'Eutelsat 28A 28,5°E',
        'ASTRA2 28,2°E',
        'ASTRA3 23,5°E',
        'ASTRA1 19,2°E',
        'Eutelsat 16A 16°E',
        'Hot Bird 13°E',
        'Eutelsat 9A 9°E',
        'Eutelsat 7A 7°E',
        'ASTRA4A 4,8°E',
        'Thor/Intelsat10-02 0,8/1°W',
        'Eutelsat 5 West A 5°W',
        'Nilesat 7°W',
        'Eutelsat 7 West A 7,2°W',
        'Eutelsat 8 West A 8°W',
        'Eutelsat 12 West A 12,5°W',
        'Telstar12 15°W',
        'Intelsat901 18°W',
        'Hispasat 30°W',
        'Pan Am Sat 43°W',
        '_3001'

    )
}



CABLES ={
    'rows': 5,
    'elements': (
        'Cable analog  ANT TV',
        'Terrestrial (DVB-T/T2) ANT TV',
        'Cable (DVB-C) ANT TV',
        'Satellite (DVB-S/S2  cable 1) ANT SAT',
        'Satellite (DVB-S/S2 cable 2) ANT SAT2'
    )
}



NETWORKS_GERMANY_DVBS ={
    'rows': 3,
    'elements': (
        'ASTRA LCN',
        'HD Austria',
        'Standard'
    )
}



NETWORK_CONFIGURATION = {
    'rows': 1,
    'elements': (
        'Configure now',
        'Do not configure or configure later'
    )
}

START_SCAN ={
    'rows': 1,
    'elements': (
        'Start automatic search',
        'Cancel'
    )
}

INITIAL_SCAN_WIZARD_LOCATIONS = {
    'rows': 7,
    'elements': (
        '(A) Austria',
        '(AUS) Australia',
        '(B) Belgium',
        '(CH) Switzerland',
        '(CN) China',
        '(CZ) Czech Republic',
        '(D) Germany',
        '(DK) Denmark',
        '(E) Spain',
        '(F) France',
        '(FIN) Finland',
        '(H) Hungary',
        '(I) Italy',
        '(IN) India',
        '(IRL) Ireland',
        '(L) Luxembourg',
        '(N) Norway',
        '(NL) Netherlands',
        '(NZ) New Zealand',
        '(P) Portugal',
        '(PL) Poland',
        '(RUS) Russia',
        '(S) Sweden',
        '(SK)Slovakia',
        '(SLO) Slovenia',
        '(TR) Turkey',
        '(UK)  United Kingdom',
        'Other country'
    )
}

AGE_LOCK = {
    'rows': 1,
    'elements': (
        'No age-related lock',
        'Special security level'
    )

}

NETWORKS_GERMANY_DVBC = {
    'rows': 3,
    'elements': (
        'Unitymedia',
        'Primacom',
        'Standard'
    )
}

INFORM_ABOUT_NEW_SOFTWARE  = {
    'rows': 1,
    'elements': (
        'Inform about new software',
        'Do not inform'
    )
}


DVBS_SATELLITES_CONFIGURATION = {
    'rows': 6,
    'elements': (
        'Single satellite',
        '2 satellites on 22 kHz switchbox',
        '2 satellites on toneburst switch',
        'Max. 4 satellites on DiSEqC multiswitch',
        'DiSEqC unicable communal system',
        'Other communal installation'
    )
    
}
