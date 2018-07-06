/**
 * @fileOverview A collection of enumerators.
 * @name Enumerators
*/

/**
 * @name _noname_
 * @desc List of global variables.
 * @example
 * YES
 * NO
 * DO_NOT_CHANGE
 * DO_NOT_CHECK
*/
var YES = 1;
var NO = 0;
// Value 'NOT' - Not available (used for connected cables)
var NOT = -1;
var DO_NOT_CHANGE = "DNC";
var DO_NOT_CHECK = "DNC";

/**
 * @name Location
 * @desc List of locations.
 * See values-basic-settings.h:
 * ENUM_SL2_TVAPI_BASIC_SETTINGS_ENUM_TVSET_Location
 * @example
 * Location.AUSTRALIA
 * Location.AUSTRIA
 * Location.BELARUS
 * Location.BELGIUM
 * Location.BULGARIA
 * Location.CHINA
 * Location.CROATIA
 * Location.CYPRUS
 * Location.CZECHREPUBLIC
 * Location.DENMARK
 * Location.ESTONIA
 * Location.FINLAND
 * Location.FRANCE
 * Location.GERMANY
 * Location.GREATBRITAIN
 * Location.GREECE
 * Location.HUNGARY
 * Location.ICELAND
 * Location.IRELAND
 * Location.ITALY
 * Location.KOREA
 * Location.LATVIA
 * Location.LIECHTENSTEIN
 * Location.LITHUANIA
 * Location.LUXEMBOURG
 * Location.MALTA
 * Location.NETHERLANDS
 * Location.NEWZEALAND
 * Location.NORWAY
 * Location.POLAND
 * Location.PORTUGAL
 * Location.ROMANIA
 * Location.RUSSIA
 * Location.SERBIA
 * Location.SLOVAKIA
 * Location.SLOVENIA
 * Location.SPAIN
 * Location.SWEDEN
 * Location.SWITZERLAND
 * Location.TURKEY
 * Location.UKRAINE
 * Location.OTHERCOUNTRY
*/
var Location = {
    AUSTRIA: 0,
    AUSTRALIA: 1,
    BELGIUM: 2,
    CHINA: 3,
    CZECHREPUBLIC: 4,
    DENMARK: 5,
    FINLAND: 6,
    FRANCE: 7,
    GERMANY: 8,
    GREATBRITAIN: 9,
    GREECE: 10,
    HUNGARY: 11,
    IRELAND: 12,
    ITALY: 13,
    KOREA: 14,
    LUXEMBOURG: 15,
    NETHERLANDS: 16,
    NEWZEALAND: 17,
    NORWAY: 18,
    POLAND: 19,
    PORTUGAL: 20,
    RUSSIA: 21,
    SLOVENIA: 22,
    SPAIN: 23,
    SWEDEN: 24,
    SWITZERLAND: 25,
    TURKEY: 26,
    OTHERCOUNTRY: 27,
    SLOVAKIA: 28,
    ROMANIA: 29,
    BULGARIA: 30,
    CYPRUS: 31,
    ESTONIA: 32,
    ICELAND: 33,
    LATVIA: 34,
    LITHUANIA: 35,
    MALTA: 36,
    LIECHTENSTEIN: 37,
    BELARUS: 38,
    UKRAINE: 39,
    SERBIA: 40,
    CROATIA: 41,
};

/**
 * @name Source
 * @desc List of search sources.
 * See values-channelsearch.h:
 * ENUM_SL2_TVAPI_CHANNEL_SEARCH_SOURCE
 * @example
 * Source.ANALOG
 * Source.DVB_T
 * Source.DVB_C
 * Source.DVB_S
 * Source.IP
*/
var Source = {
    ANALOG: 10,
    DVB_T: 11,
    DVB_C: 12,
    DVB_S: 13,
    IP:14,
};

/**
 * @name Operator
 * @desc List of operators.
 * See values-channelsearch.h:
 * ENUM_SL2_TVAPI_CHANNEL_SEARCH_NETWORKS
 * @example
 * Operator.ASTRA
 * Operator.ASTRA_GERMANY
 * Operator.AUSTRIASAT
 * Operator.CANAL_DIGITAL
 * Operator.CANALSAT
 * Operator.CD_CABLE_N
 * Operator.CD_CABLE_S
 * Operator.CD_CABLE_DK
 * Operator.CD_CABLE_FIN
 * Operator.CD_SAT_HD
 * Operator.CD_SAT_SD
 * Operator.CD_THOR
 * Operator.COMHEM
 * Operator.CYFRA
 * Operator.DVBT_ITALY
 * Operator.DVBT_FRANCE
 * Operator.DVBT2_GERMANY
 * Operator.FRANSAT
 * Operator.FREEVIEW
 * Operator.NORDIG
 * Operator.NUMERIC_CABLE (FRANCE)
 * Operator.NUMERIC_CABLE_BELGIUM,
 * Operator.NUMERIC_CABLE_LUXEMBOURG,
 * Operator.PRIMACOM
 * Operator.SKYLINK_CZE
 * Operator.SKYLINK_SLK
 * Operator.STOFA
 * Operator.TELENET
 * Operator.TELESAT_L
 * Operator.TERACOM
 * Operator.TIVU
 * Operator.TELESAT_B
 * Operator.TV_VLAANDEREN_HD
 * Operator.TV_VLAANDEREN_SD
 * Operator.UNITYMEDIA
 * Operator.UPC_AUT
 * Operator.UPC_CZECH
 * Operator.UPC_IRELAND
 * Operator.UPC_HUNGARY
 * Operator.UPC_NETHERLANDS
 * Operator.UPC_POLAND
 * Operator.UPC_ROMANIA
 * Operator.UPC_SLOVAKIA
 * Operator.UPC_SLOVENIA
 * Operator.UPC_SWITZERLAND
 * Operator.VOO
 * Operator.WAOO
 * Operator.YOUSEE
 * Operator.WAOO
 * Operator.ZIGGO
 * Operator.ZIGGO_OTHERS
 * Operator.SIMPLI_TV
 * Operator.STANDARD
 * Operator.COVERED
*/
var Operator = {
    ASTRA: 0,
    ASTRA_GERMANY: 1,
    TELENET: 2,
    TV_VLAANDEREN_HD: 3,
    TELESAT_B: 4,
    ZIGGO: 5,
    UPC_NETHERLANDS: 6,
    CANAL_DIGITAL: 7,
    YOUSEE: 8,
    STOFA: 9,
    NORDIG: 10,
    COMHEM: 11,
    NUMERIC_CABLE: 12,
    CANALSAT: 13,
    TELESAT_L: 14,
    TIVU: 15,
    UPC_SWITZERLAND: 16,
    TERACOM: 17,
    CD_SAT_HD: 18,
    CD_THOR: 19,
    FREEVIEW: 20,
    CD_CABLE_N: 21,
    CD_CABLE_S: 22,
    CD_CABLE_DK: 23,
    CD_CABLE_FIN: 24,
    DVBT_ITALY: 25,
    UPC_AUT: 26,
    CYFRA: 27,
    UNITYMEDIA: 28,
    AUSTRIASAT: 29,
    SKYLINK_CZE: 30,
    SKYLINK_SLK: 31,
    UPC_POLAND: 32,
    UPC_ROMANIA: 33,
    UPC_HUNGARY: 34,
    UPC_IRELAND: 35,
    DVBT_FRANCE: 36,
    FRANSAT: 37,
    UPC_CZECH: 38,
    UPC_SLOVAKIA: 39,
    UPC_SLOVENIA: 40,
    TV_VLAANDEREN_SD: 41,
    CD_SAT_SD: 42,
    VOO: 43,
    WAOO: 44,
    PRIMACOM: 45,
    TENTERTAIN: 46,
    THUEGA: 47,
    AUSTRIASAT_MAGYAR: 48,
    NUMERIC_CABLE_BELGIUM: 49,
    NUMERIC_CABLE_LUXEMBOURG: 50,
    ZIGGO_OTHERS: 51,
    DVBT2_GERMANY: 52,
    SIMPLI_TV: 53,
    STANDARD: 200,
    COVERED: 1000
};

/**
 * @name Modulation
 * @desc List of QAM modulations.
 * See values-channelsearch.h:
 * ENUM_SL2_TVAPI_CHANNEL_SEARCH_QAM
 * @example
 * Modulation.QAM_16
 * Modulation.QAM_32
 * Modulation.QAM_64
 * Modulation.QAM_128
 * Modulation.QAM_256
 * Modulation.QAM_1024
 * Modulation.QAM_4096
*/
var Modulation ={
    QAM_16: 1,
    QAM_32: 2,
    QAM_64: 3,
    QAM_128: 4,
    QAM_256: 5,
    QAM_1024: 6,
    QAM_4096: 7
};

/**
 * @name Voltage
 * @desc List of availabe voltage settings.
 * See values-antenna.h:
 * SL2_TVAPI_I32_ANTENNA_DVBT_SUPPLY_VOLTAGE
 * @example
 * Voltage._0V
 * Voltage._5V
*/
var Voltage ={
    _0V: 0,
    _5V: 1
};

/**
 * @name SearchMethod
 * @desc List of search methods.
 * See values-channelsearch.h:
 * ENUM_SL2_TVAPI_CHANNEL_SEARCH_METHOD
 * @example
 * SearchMethod.FREQUENCY
 * SearchMethod.CHANNEL
 * SearchMethod.NETWORK
*/
var SearchMethod = {
    FREQUENCY: 0,
    CHANNEL: 1,
    NETWORK: 2,
};


/**
 * @name Time
 * @desc List of availabe time control settings.
 * See values-datetime.h:
 * SL2_TVAPI_I32_DATETIME_TIME_LOCKED
 * @example
 * Time.EDITABLE
 * Time.READ_ONLY
 * Time.LOCKED
*/
var Time ={
    EDITABLE: 0,
    READ_ONLY: 1,
    LOCKED: 2
};

/**
 * @name Mediatype
 * @desc List of service mediatypes.
 * @example
 * MediaType.TV
 * MediaType.RADIO
*/
var MediaType ={
    TV: 4,
    Tv: 4,
    RADIO: 8,
    Radio: 8
};

/**
 * @name UpdateType
 * @desc Types of servicelist updates.
 * @example
 * UpdateType.NEW - new found services are detected
 * UpdateType.UNFOUND - unfound services are detected
*/
var UpdateType ={
    NEW: 128,
    UNFOUND: 256
};

/**
 * @name SearchState
 * @desc List of search states.
 * See values-channelsearch.h:
 * ENUM_SL2_TVAPI_CHANNEL_SEARCH_SEARCH_STATE
 * @example
 * SearchState.FINISHED
 * SearchState.SEARCHING
 * SearchState.SORTING
 * SearchState.SELECTING
 * SearchState.STORING
 * SearchState.LSN_CLASHES
 * SearchState.NEW_FOUND_TV
 * SearchState.NOT_FOUND_TV
 * SearchState.NEW_FOUND_RADIO
 * SearchState.NOT_FOUND_RADIO
 * SearchState.SCAN_RESULTS
 * SearchState.SCAN_ERROR
*/
var SearchState = {
    FINISHED: 0,
    SEARCHING: 1,
    SORTING: 2,
    SELECTING: 3,
    STORING: 4,
    LSN_CLASHES: 5,
    NEW_FOUND_TV: 6,
    NOT_FOUND_TV: 7,
    NEW_FOUND_RADIO: 8,
    NOT_FOUND_RADIO: 9,
    SCAN_RESULTS: 10,
    SCAN_ERROR: 11,
    IDLE: 12
};

/**
 * @name Key
 * @desc List of Remote Control keys.
 * See values-system.h:
 * ENUM_SL2_TVAPI_I32_SYSTEM_ACTION_KEY_SYSCMD
 * @example
 * Key.FAST_FWD
 * Key.OK
 * Key.END
 * Key.OFF
*/
var Key = {
    FAST_FWD: 40,
    GLOBAL_MENU: 17,
    CONTEXT_MENU: 20,
    OK: 23,
    END: 21,
    OFF: 10,
    EPG: 16,
    UP: 24,
    DOWN: 25,
    LEFT: 26,
    RIGHT: 27,
    CHANNEL_UP: 30,
    CHANNEL_DOWN: 31
};

/**
 * @name ScanError
 * @desc List of Remote Control keys.
 * See values-system.h:
 * ENUM_SL2_TVAPI_CHANNEL_SEARCH_ERROR
 * @example
 * ScanError.NO_ERROR
*/
var ScanError = {
    NO_ERROR: 0,
    PATH_CREATE: 1,
    TUNER_NOT_LOCK: 2,
    HOMING_CHANNEL_NOT_FOUND: 3,
    SCAN_CANCELED: 4,
    OPERATOR_PROFILE_NOT_FOUND: 5,
    OPERATOR_PROFILE_DELIVERY_SYSTEM_MISMACH: 6
};

/**
 * @name Message
 * @desc List of displayed messages.
 * See values-messages.h:
 * ENUM_SL2_TVAPI_MESSAGE_ID
 * @example
 * Message.NO_MESSAGE
 * Message.TEST_LOW_PRIORITY
 * Message.TEST_MEDIUM_PRIORITY
 * Message.TEST_HIGH_PRIORITY
 * Message.TIME_DATE
 * Message.EPGINF
 * Message.NOSIG_PARAM
 * Message.NOSIG_TUNER
 * Message.NOSIG_NOSIG
 * Message.PROG_INFO_WAIT
 * Message.NO_PROG_INFO
 * Message.SUBTITLE_WAIT
 * Message.NO_SUBTITLE
 * Message.VCR_REC
 * Message.NO_PROG
 * Message.RGCIP
 * Message.PRGNOVID
 * Message.PRGNOAUD
 * Message.PRGNOVIDAUD
 * Message.LNC_NOSUP
 * Message.TIMER_STARTED
 * Message.PREPARE_REC
 * Message.TIMRECA
 * Message.NOTMRFREE
 * Message.TMRPRGNAVL
 * Message.NOTPEAV
 * Message.DATOUT
 * Message.TAPELOCK
 * Message.NOTAPE
 * Message.TIMOVR
 * Message.PERPAG_SRCH
 * Message.PGRSW_TIMER
 * Message.PGRSW_NOSIG
 * Message.PGRSW_MANREC
 * Message.PGRSW_TUNNA
 * Message.SORT_WAIT
 * Message.DVB_NODSP
 * Message.HDR_OFF
 * Message.PVR_ALWAYSON_ON
 * Message.DR_FILECHECK_HINT
 * Message.DR_READY
 * Message.ARCHIVEREC_STARTED
 * Message.REC_START_FAILURE
 * Message.ARCHIVEREC_NO_START
 * Message.ARCHIVEREC_ALREADY
 * Message.ARCHIVEREC_STOPPED
 * Message.ARCHIVEREC_NO_STOP
 * Message.TIMERPROG_CHANGED
 * Message.RECORDING_EXTENDED
 * Message.HDR_CRASHED
 * Message.NO_PROG_SWITCH
 * Message.HDR_BOOKMARK_SET
 * Message.HDR_FADEOUT_ABORT
 * Message.COPY_ON_HDR
 * Message.COPY_SUCCESS
 * Message.HDR_COPY_CANCEL
 * Message.HDR_CANCEL
 * Message.WAIT_FOR_TIMER
 * Message.MACROVISION
 * Message.NO_PROG_REC
 * Message.TIM_REC_ALREADY
 * Message.MOVED_TO_ARCHIVE
 * Message.HDR_NOT_RECORDING
 * Message.HDR_NO_DISC_SPACE_LONG
 * Message.HDR_FADEOUT_SKIPPED_NEW
 * Message.PIP_NOT_POSS_HDRCOPY
 * Message.CSH_DR_DATA_MISSING
 * Message.DATA_MISSING_NOBACK
 * Message.HDR_NOT_READY
 * Message.DR_ACTIVE_AGAIN
 * Message.FASTREW_NOTPOSS
 * Message.NO_SLOW_MOTION_HD
 * Message.DR_NOT_POSSIBLE
 * Message.DESCRAMBLING_STARTED
 * Message.DESCRAMBLING_SUCCESS
 * Message.DESCRAMBLING_FULL
 * Message.DESCRAMBLING_ERROR
 * Message.HDR_NOT_READY_LONG
 * Message.TV_AS_CENTER
 * Message.NO_COPY_REC
 * Message.RETENTION_TIME_DEL
 * Message.RETENTION_TIME
 * Message.FORMAT_EXT_NOTPOSS
 * Message.SWITCH_OFFON_HINT
 * Message.FORMATTING_END
 * Message.FORMATTING_ACTIVE
 * Message.FORMAT_FAILED
 * Message.FILECHECK_ACTIVE
 * Message.NO_POWER_OFF
 * Message.FILECHECK_SUCCESS
 * Message.FILECHECK_SUCCESS_ERR
 * Message.FILECHECK_ERROR
 * Message.FILECHECK_FAILED
 * Message.FILE_CHECK_RUN
 * Message.FILE_CHECK_END
 * Message.FILECHECK_ERROR_FIX_HINT
 * Message.DR_FOLLOW_ME_NO_SKIP
 * Message.DR_FOLLOW_ME_NO_WIND
 * Message.FOLLOW_ME_SWITCHOFF
 * Message.INSTANT_PLAYBACK_NOTIFY
 * Message.PROTECTED_REC
 * Message.SOUND_VIA_AURO
 * Message.SOUND_VIA_LSP
 * Message.NOREC
 * Message.NOVCRSOURCE
 * Message.PLAYA
 * Message.RECA
 * Message.TAPEERROR
 * Message.BATTERY_EMPTY
 * Message.NO_DIG_SOUND
 * Message.NO_DOLBY_DIGITAL
 * Message.EPG_NO_SWITCH
 * Message.NO_FUNCTION
 * Message.NO_FUNCTION_TIMER
 * Message.SLEEPMES
 * Message.NO_RECORDER
 * Message.HEAT_SWITCHOFF
 * Message.MEMO_PROGRAMME
 * Message.REC_CANCELLED
 * Message.PAUSE
 * Message.AV_PROG_USED
 * Message.PROG_NOT_POSSIBLE
 * Message.PRG_SWITCH_BG
 * Message.RESET_FACTORY_PICSND
 * Message.CA_IN_USE
 * Message.MPEG4_DEC_IN_USE
 * Message.PROG_NOT_AVAIL
 * Message.NOSWITCH_NEWSFL
 * Message.STDVAL_LOADED
 * Message.AUDIO_DIGIN
 * Message.COPY_STARTED
 * Message.DLINK_HD_ACTIVE
 * Message.DLINK_HD_INACTIVE
 * Message.HDMI_CONTROL
 * Message.NETW_ASPECT_HINT
 * Message.MSG_WAIT
 * Message.MEDIANETWORK_STARTING
 * Message.IRADIO_STARTING
 * Message.NOTTX_DR_PLAY
 * Message.NOTTX_DESCRAMBLE
 * Message.NOPIP_DESCRAMBLE
 * Message.FUNCTION_NOT_POSSIBLE
 * Message.PERSPAGES_VPS_LOCK
 * Message.NOPIP_DRCOPY
 * Message.CIPLUS_NO_REC
 * Message.CIPLUS_PIN_NOCAM
 * Message.BROWSER_STARTING
 * Message.BROWSER_VOD_WARN_LEAVE
 * Message.HOTEL_CH_HINT
 * Message.EPG_ANA_HINT
 * Message.AUTO_OFF_HINT
 * Message.SWITCH_HD_TO_SD
 * Message.SD_HD_SIMULCAST
 * Message.AUTO_OFF_AV
 * Message.SHOPMODE_HINT
 * Message.NEWDEV_CHECK
 * Message.NEWDEV_ERROR
 * Message.VIDEO_NO_SUPPORT
 * Message.VIDEO_PART_SUPPORT
 * Message.AUDIODES_ACTIV
 * Message.AUDIODES_DEACTIV
 * Message.AUDIODESC_AVAIL
 * Message.AUDIODESC_NOTAVAIL
 * Message.PROG_MEM_FOR_REC
 * Message.NOPIP_3D
 * Message.GLASSES_3D
 * Message.NO_HBBTV_PIP
 * Message.STAT_NO_HBBTV
 * Message.HBBTV_SEARCH
 * Message.HBBTV_TTX_SEARCH
 * Message.HBBTV_END
 * Message.HBBTV_END_RESTART
 * Message.HBBTV_ASPECT_RATIO
 * Message.NO_HBBTV_TIMESHIFT
 * Message.HBBTV_PLAY_NOREC
 * Message.DCM_NIGHT_UPDATE
 * Message.DCM_NUPD_ACTIVE
 * Message.DCM_NUPD_CHG_HINT
 * Message.MHP_SW_UPDATE_ERROR_1
 * Message.MHP_SW_UPDATE_ERROR_2
 * Message.ERR_MHP_DONGLE
 * Message.NOSIG_ERROR_RATE_TARGET
 * Message.NOSIG_ERROR_RATE
 * Message.NOSIG_OVERLOAD_TARGET
 * Message.NOSIG_OVERLOAD
 * Message.NOSIG_OVERLOAD_FIX_TARGET
 * Message.NO_SIGNAL
 * Message.NOSIG
 * Message.CI_ERROR_SLOT_1
 * Message.CI_ERROR_SLOT_2
 * Message.HDR_DR_NOT_READY
 * Message.HDR_VIDEO_NOT_READY
 * Message.DR_FM_STDBY_HOURS
 * Message.DR_FM_STDBY
 * Message.MAX_VOLUME_HINT
 * Message.MAX_VOLUME_HINT_RADIO
 * Message.MAX_VOLUME_HINT_MUSIC
 * Message.DR_COPY_SUCCESS
 * Message.DR_COPY_NOT_STARTED
 * Message.DR_COPY_ERROR
 * Message.NEWDEV_SUCCESS
 * Message.NEWDEV_SUCCESS_VAR
 * Message.CONFIRM_WAKE_UP
 * Message.ALARM
 * Message.PIN_REQUEST
 * Message.PIN_REQUEST_RETRY
 * Message.NEWSFLASH
 * Message.NO_TTX
 * Message.NO_TTX_PAGE
 * Message.CIPLUS_PIN_REQUEST
 * Message.CIPLUS_PIN_REQUEST_RETRY
 * Message.BROWSER_ERROR_PAGE_NOTLOAD
 * Message.KEY_NO_FUNCTION
 * Message.STOP_RECORDING
 * Message.STOP_COPYING
 * Message.STOP_DESCRAMBLING
 * Message.STOP_VPS_RECORDING
 * Message.FAV_ON_DASHBOARD
 * Message.FAV_ALREADY_ON_DASHBOARD
 * Message.EPGNOTE_WATCH
 * Message.EPGNOTE_LISTEN
 * Message.ADOPT_COVER
 * Message.NETWORK_SETTINGS_RESET
 * Message.EPGNOTE_STDBY
 * Message.CA_AUTOSEARCH
 * Message.CA_UPDATE_LIST
 * Message.CA_ADAPT_LIST
 * Message.HDR_CONFIRM_DELETION
 * Message.BROWSER_ALERT
 * Message.BROWSER_CONFIRM
 * Message.BROWSER_PROMPT
 * Message.BROWSER_AUTH
 * Message.BROWSER_ERROR_MEMORY
 * Message.BROWSER_ERROR_DOCUMENT_FORMAT
 * Message.BROWSER_ERROR_DOCUMENT_EMPTY
 * Message.BROWSER_ERROR_DOCUMENT_INVALID
 * Message.BROWSER_ERROR_JAVA_SCRIPT
 * Message.BROWSER_ERROR_PLUGIN
 * Message.BROWSER_ERROR_FILE_NOT_FOUND
 * Message.BROWSER_ERROR_FILE_NO_ACCESS
 * Message.BROWSER_ERROR_GENERAL
 * Message.BROWSER_ERROR_SERVER_INVALID
 * Message.BROWSER_ERROR_NETWORK_CONNECTION
 * Message.BROWSER_ERROR_NETWORK_TIMEOUT
 * Message.BROWSER_ERROR_NETWORK_NO
 * Message.BROWSER_ERROR_NETWORK_SOCKET
 * Message.BROWSER_ERROR_HTTP_REQUEST
 * Message.BROWSER_ERROR_HTTP_NO_ACCESS
 * Message.BROWSER_ERROR_HTTP_NOT_PERMITTED
 * Message.BROWSER_ERROR_HTTP_NOT_FOUND
 * Message.BROWSER_ERROR_HTTP_EMPTY
 * Message.BROWSER_ERROR_HTTP_SERVER
 * Message.HIFIVOL_NOT_POSS
 * Message.PICTURE_ADJUST_CHANGE
 * Message.ENERGY_EFF_CHANGE
 * Message.HDR_STOP_TIMESHIFT
 * Message.FORMAT_INTEGRATED
 * Message.FORMAT_EXTERNAL
 * Message.FILECHECK_INT
 * Message.MAX_DASHBOARD_ENTRIES
 * Message.NO_TIMESHIFT
 * Message.DIVX_DEREG_QUEST
 * Message.DIVX_DEREG_CODE
 * Message.DIVX_REG_CODE
 * Message.DIVX_AUTHORIZATION_ERROR
 * Message.DIVX_RENTAL_EXPIRED
 * Message.DIVX_RENTAL_CONFIRMATION
 * Message.ADOPT_AS_START_PAGE
 * Message.DYNAMIC_TEXT_WITH_TIMEOUT
 * Message.DCM_LIVE
 * Message.OPTIME_USER_HINT
 * Message.ECO_MODE
 * Message.HDR_USB_TIMESHIFT
 * Message.LOAD_ACTIVE
 * Message.HDR_USB_TIMESHIFT_MEM_SIZE
 * Message.FILE_NOTSUPP
 * Message.WRONG_AUDIO_FORMAT
 * Message.HDR_USB_TIMESHIFT_NO_MEDIUM
 * Message.PIN_CHECK_REQUEST
 * Message.PROGRESS_BAR_INFINITE
 * Message.DYNAMIC_TEXT_WITHOUT_TIMEOUT
 * Message.HDR_HDD_ERROR
 * Message.DUMMY_1
 * Message.STATION_NOT_RUNNING
 * Message.STATION_LOCKED
 * Message.PIN
 * Message.INPUT_FIELD_KEYS_HINT
 * Message.SOUND_VIA_ANY
 * Message.LOAD_ERROR
 * Message.LOAD_SUCCESS
 * Message.COPY_ACTIVE
 * Message.AUTO_SWITCHON_CHECK
 * Message.HDR_DR_BLOCKED
 * Message.RESET_PICTURE_SOUND_WARNING
 * Message.EMPTY_NO_TIMEOUT
 * Message.BATTERY_EMPTY_SHORT
 * Message.LSP_CONNECTION_FAILED
 * Message.TIMER_DATA_STORED
 * Message.SFB_ANNOUNCE
 * Message.AUTO_INFO_HINT
 * Message.COPY_PREPARED
 * Message.MOVE_ON_HDR
 * Message.MOVE_PREPARED
 * Message.DR_MOVE_SUCCESS
 * Message.DR_MOVE_ERROR
 * Message.DR_MOVE_NOT_STARTED
 * Message.HDR_MOVE_CANCEL
 * Message.ENERGY_EFF_CHANGE_2
 * Message.DVB_NOLIVE
 * Message.RECOMMENDATIONS
 * Message.NOPIP_MAIN_ANALOG
 * Message.HDMI_RESET_DONE
*/
var Message = {
    NO_MESSAGE: 0,
    TEST_LOW_PRIORITY: 1,
    TEST_MEDIUM_PRIORITY: 2,
    TEST_HIGH_PRIORITY: 3,
    TIME_DATE: 4,
    EPGINF: 5,
    NOSIG_PARAM: 7,
    NOSIG_TUNER: 8,
    NOSIG_NOSIG: 9,
    PROG_INFO_WAIT: 10,
    NO_PROG_INFO: 11,
    SUBTITLE_WAIT: 12,
    NO_SUBTITLE: 13,
    VCR_REC: 14,
    NO_PROG: 15,
    RGCIP: 16,
    PRGNOVID: 17,
    PRGNOAUD: 18,
    PRGNOVIDAUD: 19,
    LNC_NOSUP: 23,
    TIMER_STARTED: 24,
    PREPARE_REC: 25,
    TIMRECA: 26,
    NOTMRFREE: 27,
    TMRPRGNAVL: 28,
    NOTPEAV: 29,
    DATOUT: 31,
    TAPELOCK: 32,
    NOTAPE: 33,
    TIMOVR: 34,
    PERPAG_SRCH: 35,
    PGRSW_TIMER: 36,
    PGRSW_NOSIG: 37,
    PGRSW_MANREC: 38,
    PGRSW_TUNNA: 39,
    SORT_WAIT: 40,
    DVB_NODSP: 41,
    HDR_OFF: 42,
    PVR_ALWAYSON_ON: 43,
    DR_FILECHECK_HINT: 44,
    DR_READY: 45,
    ARCHIVEREC_STARTED: 46,
    REC_START_FAILURE: 47,
    ARCHIVEREC_NO_START: 48,
    ARCHIVEREC_ALREADY: 49,
    ARCHIVEREC_STOPPED: 50,
    ARCHIVEREC_NO_STOP: 51,
    TIMERPROG_CHANGED: 52,
    RECORDING_EXTENDED: 53,
    HDR_CRASHED: 54,
    NO_PROG_SWITCH: 55,
    HDR_BOOKMARK_SET: 56,
    HDR_FADEOUT_ABORT: 57,
    COPY_ON_HDR: 58,
    COPY_SUCCESS: 59,
    HDR_COPY_CANCEL: 60,
    HDR_CANCEL: 61,
    WAIT_FOR_TIMER: 62,
    MACROVISION: 63,
    NO_PROG_REC: 64,
    TIM_REC_ALREADY: 65,
    MOVED_TO_ARCHIVE: 66,
    HDR_NOT_RECORDING: 67,
    HDR_NO_DISC_SPACE_LONG: 68,
    HDR_FADEOUT_SKIPPED_NEW: 69,
    PIP_NOT_POSS_HDRCOPY: 70,
    CSH_DR_DATA_MISSING: 71,
    DATA_MISSING_NOBACK: 72,
    HDR_NOT_READY: 73,
    DR_ACTIVE_AGAIN: 74,
    FASTREW_NOTPOSS: 75,
    NO_SLOW_MOTION_HD: 76,
    DR_NOT_POSSIBLE: 77,
    DESCRAMBLING_STARTED: 78,
    DESCRAMBLING_SUCCESS: 79,
    DESCRAMBLING_FULL: 80,
    DESCRAMBLING_ERROR: 81,
    HDR_NOT_READY_LONG: 82,
    TV_AS_CENTER: 83,
    NO_COPY_REC: 84,
    RETENTION_TIME_DEL: 85,
    RETENTION_TIME: 86,
    FORMAT_EXT_NOTPOSS: 87,
    SWITCH_OFFON_HINT: 88,
    FORMATTING_END: 89,
    FORMATTING_ACTIVE: 90,
    FORMAT_FAILED: 91,
    FILECHECK_ACTIVE: 92,
    NO_POWER_OFF: 93,
    FILECHECK_SUCCESS: 94,
    FILECHECK_SUCCESS_ERR: 95,
    FILECHECK_ERROR: 96,
    FILECHECK_FAILED: 97,
    FILE_CHECK_RUN: 98,
    FILE_CHECK_END: 99,
    FILECHECK_ERROR_FIX_HINT: 100,
    DR_FOLLOW_ME_NO_SKIP: 101,
    DR_FOLLOW_ME_NO_WIND: 102,
    FOLLOW_ME_SWITCHOFF: 103,
    INSTANT_PLAYBACK_NOTIFY: 104,
    PROTECTED_REC: 105,
    SOUND_VIA_AURO: 107,
    SOUND_VIA_LSP: 108,
    NOREC: 109,
    NOVCRSOURCE: 110,
    PLAYA: 111,
    RECA: 112,
    TAPEERROR: 113,
    BATTERY_EMPTY: 114,
    NO_DIG_SOUND: 115,
    NO_DOLBY_DIGITAL: 116,
    EPG_NO_SWITCH: 117,
    NO_FUNCTION: 118,
    NO_FUNCTION_TIMER: 119,
    SLEEPMES: 120,
    NO_RECORDER: 121,
    HEAT_SWITCHOFF: 122,
    MEMO_PROGRAMME: 123,
    REC_CANCELLED: 124,
    PAUSE: 125,
    AV_PROG_USED: 126,
    PROG_NOT_POSSIBLE: 127,
    PRG_SWITCH_BG: 128,
    RESET_FACTORY_PICSND: 129,
    CA_IN_USE: 130,
    MPEG4_DEC_IN_USE: 131,
    PROG_NOT_AVAIL: 132,
    NOSWITCH_NEWSFL: 133,
    STDVAL_LOADED: 134,
    AUDIO_DIGIN: 135,
    COPY_STARTED: 136,
    DLINK_HD_ACTIVE: 137,
    DLINK_HD_INACTIVE: 138,
    HDMI_CONTROL: 139,
    NETW_ASPECT_HINT: 140,
    MSG_WAIT: 141,
    MEDIANETWORK_STARTING: 142,
    IRADIO_STARTING: 143,
    NOTTX_DR_PLAY: 144,
    NOTTX_DESCRAMBLE: 145,
    NOPIP_DESCRAMBLE: 146,
    FUNCTION_NOT_POSSIBLE: 147,
    PERSPAGES_VPS_LOCK: 148,
    NOPIP_DRCOPY: 150,
    CIPLUS_NO_REC: 151,
    CIPLUS_PIN_NOCAM: 152,
    BROWSER_STARTING: 153,
    BROWSER_VOD_WARN_LEAVE: 154,
    HOTEL_CH_HINT: 155,
    EPG_ANA_HINT: 156,
    AUTO_OFF_HINT: 157,
    SWITCH_HD_TO_SD: 158,
    SD_HD_SIMULCAST: 159,
    AUTO_OFF_AV: 160,
    SHOPMODE_HINT: 161,
    NEWDEV_CHECK: 162,
    NEWDEV_ERROR: 163,
    VIDEO_NO_SUPPORT: 164,
    VIDEO_PART_SUPPORT: 165,
    AUDIODES_ACTIV: 166,
    AUDIODES_DEACTIV: 167,
    AUDIODESC_AVAIL: 168,
    AUDIODESC_NOTAVAIL: 169,
    PROG_MEM_FOR_REC: 170,
    NOPIP_3D: 171,
    GLASSES_3D: 172,
    NO_HBBTV_PIP: 174,
    STAT_NO_HBBTV: 175,
    HBBTV_SEARCH: 176,
    HBBTV_TTX_SEARCH: 177,
    HBBTV_END: 178,
    HBBTV_END_RESTART: 179,
    HBBTV_ASPECT_RATIO: 180,
    NO_HBBTV_TIMESHIFT: 181,
    HBBTV_PLAY_NOREC: 182,
    DCM_NIGHT_UPDATE: 183,
    DCM_NUPD_ACTIVE: 184,
    DCM_NUPD_CHG_HINT: 185,
    MHP_SW_UPDATE_ERROR_1: 186,
    MHP_SW_UPDATE_ERROR_2: 187,
    ERR_MHP_DONGLE: 188,
    NOSIG_ERROR_RATE_TARGET: 189,
    NOSIG_ERROR_RATE: 190,
    NOSIG_OVERLOAD_TARGET: 191,
    NOSIG_OVERLOAD: 192,
    NOSIG_OVERLOAD_FIX_TARGET: 193,
    NO_SIGNAL: 194,
    NOSIG: 195,
    CI_ERROR_SLOT_1: 196,
    CI_ERROR_SLOT_2: 197,
    HDR_DR_NOT_READY: 198,
    HDR_VIDEO_NOT_READY: 199,
    DR_FM_STDBY_HOURS: 200,
    DR_FM_STDBY: 201,
    MAX_VOLUME_HINT: 202,
    MAX_VOLUME_HINT_RADIO: 203,
    MAX_VOLUME_HINT_MUSIC: 204,
    DR_COPY_SUCCESS: 205,
    DR_COPY_NOT_STARTED: 206,
    DR_COPY_ERROR: 207,
    NEWDEV_SUCCESS: 208,
    NEWDEV_SUCCESS_VAR: 209,
    CONFIRM_WAKE_UP: 210,
    ALARM: 211,
    PIN_REQUEST: 212,
    PIN_REQUEST_RETRY: 213,
    NEWSFLASH: 214,
    NO_TTX: 215,
    NO_TTX_PAGE: 216,
    CIPLUS_PIN_REQUEST: 217,
    CIPLUS_PIN_REQUEST_RETRY: 218,
    BROWSER_ERROR_PAGE_NOTLOAD: 219,
    KEY_NO_FUNCTION: 220,
    STOP_RECORDING: 221,
    STOP_COPYING: 222,
    STOP_DESCRAMBLING: 223,
    STOP_VPS_RECORDING: 224,
    FAV_ON_DASHBOARD: 225,
    FAV_ALREADY_ON_DASHBOARD: 226,
    EPGNOTE_WATCH: 227,
    EPGNOTE_LISTEN: 228,
    ADOPT_COVER: 229,
    NETWORK_SETTINGS_RESET: 230,
    EPGNOTE_STDBY: 231,
    CA_AUTOSEARCH: 232,
    CA_UPDATE_LIST: 233,
    CA_ADAPT_LIST: 234,
    HDR_CONFIRM_DELETION: 235,
    BROWSER_ALERT: 236,
    BROWSER_CONFIRM: 237,
    BROWSER_PROMPT: 238,
    BROWSER_AUTH: 239,
    BROWSER_ERROR_MEMORY: 240,
    BROWSER_ERROR_DOCUMENT_FORMAT: 241,
    BROWSER_ERROR_DOCUMENT_EMPTY: 242,
    BROWSER_ERROR_DOCUMENT_INVALID: 243,
    BROWSER_ERROR_JAVA_SCRIPT: 244,
    BROWSER_ERROR_PLUGIN: 245,
    BROWSER_ERROR_FILE_NOT_FOUND: 246,
    BROWSER_ERROR_FILE_NO_ACCESS: 247,
    BROWSER_ERROR_GENERAL: 248,
    BROWSER_ERROR_SERVER_INVALID: 249,
    BROWSER_ERROR_NETWORK_CONNECTION: 250,
    BROWSER_ERROR_NETWORK_TIMEOUT: 251,
    BROWSER_ERROR_NETWORK_NO: 252,
    BROWSER_ERROR_NETWORK_SOCKET: 253,
    BROWSER_ERROR_HTTP_REQUEST: 254,
    BROWSER_ERROR_HTTP_NO_ACCESS: 255,
    BROWSER_ERROR_HTTP_NOT_PERMITTED: 256,
    BROWSER_ERROR_HTTP_NOT_FOUND: 257,
    BROWSER_ERROR_HTTP_EMPTY: 258,
    BROWSER_ERROR_HTTP_SERVER: 259,
    HIFIVOL_NOT_POSS: 260,
    PICTURE_ADJUST_CHANGE: 261,
    ENERGY_EFF_CHANGE: 262,
    HDR_STOP_TIMESHIFT: 263,
    FORMAT_INTEGRATED: 264,
    FORMAT_EXTERNAL: 265,
    FILECHECK_INT: 266,
    MAX_DASHBOARD_ENTRIES: 267,
    NO_TIMESHIFT: 268,
    DIVX_DEREG_QUEST: 269,
    DIVX_DEREG_CODE: 270,
    DIVX_REG_CODE: 271,
    DIVX_AUTHORIZATION_ERROR: 272,
    DIVX_RENTAL_EXPIRED: 273,
    DIVX_RENTAL_CONFIRMATION: 274,
    ADOPT_AS_START_PAGE: 275,
    DYNAMIC_TEXT_WITH_TIMEOUT: 276,
    DCM_LIVE: 277,
    OPTIME_USER_HINT: 278,
    ECO_MODE: 279,
    HDR_USB_TIMESHIFT: 280,
    LOAD_ACTIVE: 281,
    HDR_USB_TIMESHIFT_MEM_SIZE: 282,
    FILE_NOTSUPP: 283,
    WRONG_AUDIO_FORMAT: 284,
    HDR_USB_TIMESHIFT_NO_MEDIUM: 285,
    PIN_CHECK_REQUEST: 286,
    PROGRESS_BAR_INFINITE: 287,
    DYNAMIC_TEXT_WITHOUT_TIMEOUT: 288,
    HDR_HDD_ERROR: 289,
    DUMMY_1: 290,
    STATION_NOT_RUNNING: 291,
    STATION_LOCKED: 292,
    PIN: 293,
    INPUT_FIELD_KEYS_HINT: 294,
    SOUND_VIA_ANY: 295,
    LOAD_ERROR: 296,
    LOAD_SUCCESS: 297,
    COPY_ACTIVE: 298,
    AUTO_SWITCHON_CHECK: 299,
    HDR_DR_BLOCKED: 300,
    RESET_PICTURE_SOUND_WARNING: 301,
    EMPTY_NO_TIMEOUT: 302,
    BATTERY_EMPTY_SHORT: 303,
    LSP_CONNECTION_FAILED: 304,
    TIMER_DATA_STORED: 305,
    SFB_ANNOUNCE: 306,
    AUTO_INFO_HINT: 307,
    COPY_PREPARED: 308,
    MOVE_ON_HDR: 309,
    MOVE_PREPARED: 310,
    DR_MOVE_SUCCESS: 311,
    DR_MOVE_ERROR: 312,
    DR_MOVE_NOT_STARTED: 313,
    HDR_MOVE_CANCEL: 314,
    ENERGY_EFF_CHANGE_2: 315,
    DVB_NOLIVE: 316,
    RECOMMENDATIONS: 317,
    NOPIP_MAIN_ANALOG: 318,
    HDMI_RESET_DONE: 319
};

/**
 * @name OSDcontrol
 * @desc List of OSD controls.
 * See values-messages.h:
 * ENUM_SL2_TVAPI_MESSAGES_SELECTORS
 * @example
 * OSDcontrol.OK
 * OSDcontrol.CANCEL
 * OSDcontrol.YES
 * OSDcontrol.NO
 * OSDcontrol.RETRY
 * OSDcontrol.IGNORE
 * OSDcontrol.ESCAPE
 * OSDcontrol.TEXT
 * OSDcontrol.PASSWORD
 * OSDcontrol.DCM_AT_ONCE
 * OSDcontrol.DCM_AFTER_SWITCH_OFF
 * OSDcontrol.DCM_LATER
 * OSDcontrol.IMMEDIATTLY
 * OSDcontrol.AFTER_SWITCH_OFF
 * OSDcontrol.LATER
 * OSDcontrol.ADOPT
 * OSDcontrol.CLOSE
*/
var OSDcontrol = {
    OK: 0,
    CANCEL: 1,
    YES: 2,
    NO: 3,
    RETRY: 4,
    IGNORE: 5,
    ESCAPE: 6,
    TEXT: 7,
    PASSWORD: 8,
    DCM_AT_ONCE: 9,
    DCM_AFTER_SWITCH_OFF: 10,
    DCM_LATER: 11,
    IMMEDIATTLY: 9,
    AFTER_SWITCH_OFF: 10,
    LATER: 11,
    ADOPT: 12,
    CLOSE: 13
};
/**
 * @name DCMflow
 * @desc List of DCM live flows.
 * @example
 * DCMflow.IMMEDIATELY
 * DCMflow.AFTER_STANDBY
 * DCMflow.LATER
*/
var DCMflow = {
// Values match corresponding OSD controls
    IMMEDIATELY: 9,
    BEFORE_STANDBY: 10,
    AFTER_STANDBY: 10,
    LATER: 11
};

/**
 * @name SatScheme
 * @desc List of schemes of satellite installation
 * See values-antenna.h:
 * ENUM_SL2_TVAPI_I32_ANTENNA_DVBS_ENUM_INSTALLATION
 * @example
 * SatScheme.SINGLE
 * SatScheme.SWITCHBOX
 * SatScheme.TONEBURST
 * SatScheme.DISEQC_MULTI
 * SatScheme.DISEQC_ONECABLE
 * SatScheme.OTHER
*/
var SatScheme = {
    SINGLE: 0,
    SWITCHBOX: 1,
    TONEBURST: 2,
    DISEQC_MULTI: 3,
    DISEQC_ONECABLE: 4,
    OTHER: 5
};

/**
 * @name SatBand
 * @desc List of satellite band configurations
 * for "single satellite" installation.
 * See values-antenna.h:
 * SL2_TVAPI_I32_ANTENNA_DVBS_HIGH_BAND
 * @example
 * SatBand.DUAL
 * SatBand.SINGLE
*/
var SatBand = {
    SINGLE: 0,
    DUAL: 1
};

/**
 * @name Band
 * @desc Satellite band for manual scan.
 * See values-channelsearch.h:
 * SL2_TVAPI_I32_CHANNEL_SEARCH_SATELLITE_BAND
 * @example
 * Band.HORIZ_LOW
 * Band.HORIZ_HIGHT
 * Band.VERT_LOW
 * Band.VERT_HIGHT
*/
var Band = {
    HORIZ_LOW: 0,
    HORIZ_HIGHT: 1,
    VERT_LOW: 2,
    VERT_HIGHT: 3,
};
/**
 * @name Satellite
 * @desc List of short satellite names paired with full UI ones
 * @example
 * Satellite.NONE
 * Satellite.OTHER
 * Satellite.ASTRA1
 * Satellite.ASTRA2
 * Satellite.ASTRA3
 * Satellite.ASTRA4
 * Satellite.EUTELSAT7
 * Satellite.EUTELSAT9
 * Satellite.EUTELSAT16
 * Satellite.EUTELSAT28
 * Satellite.EUTELSAT36
 * Satellite.EUTELSAT_5_WEST
 * Satellite.EUTELSAT_7_WEST
 * Satellite.EUTELSAT_8_WEST
 * Satellite.EUTELSAT_12_WEST
 * Satellite.HELLAS
 * Satellite.HISPASAT
 * Satellite.HOT_BIRD
 * Satellite.INTELSAT
 * Satellite.NILESAT
 * Satellite.OPTUS
 * Satellite.PAN_AM_SAT
 * Satellite.TELSTAR
 * Satellite.THOR
 * Satellite.TURKSAT
 */
var Satellite = {
    NONE: "",
    OPTUS: "Optus D1 160°E",
    TURKSAT: "Türksat 42°E",
    HELLAS: "Hellas Sat2 39°E",
    EUTELSAT36: "Eutelsat 36A 36°E",
    EUTELSAT28: "Eutelsat 28A 28,5°E",
    ASTRA2: "ASTRA2 28,2°E",
    ASTRA3: "ASTRA3 23,5°E",
    ASTRA1: "ASTRA1 19,2°E",
    EUTELSAT16: "Eutelsat 16A 16°E",
    HOT_BIRD: "Hot Bird 13°E",
    EUTELSAT9: "Eutelsat 9A 9°E",
    EUTELSAT7: "Eutelsat 7A 7°E",
    ASTRA4: "ASTRA4A 4,8°E",
    THOR: "Thor/Intelsat10-02 0,8/1°W",
    EUTELSAT_5_WEST: "Eutelsat 5 West A 5°W",
    NILESAT: "Nilesat 7°W",
    EUTELSAT_7_WEST: "Eutelsat 7 West A 7,2°W",
    EUTELSAT_8_WEST: "Eutelsat 8 West A 8°W",
    EUTELSAT_12_WEST: "Eutelsat 12 West A 12,5°W",
    TELSTAR: "Telstar12 15°W",
    INTELSAT: "Intelsat901 18°W",
    HISPASAT: "Hispasat 30°W",
    PAN_AM_SAT: "Pan Am Sat 43°W",
    OTHER: "#3001"
};
/**
 * @name UpdateSource
 * @desc SW update source.
 * See values-softwareupdate.h:
 * ENUM_SL2_TVAPI_SOFTWARE_UPDATE_SOURCES
 * @example
 * UpdateSource.NONE,
 * UpdateSource.USB,
 * UpdateSource.INTERNET,
 * UpdateSource.DVBT,
 * UpdateSource.DVBS
*/
var UpdateSource = {
    NONE: 0,
    USB: 1,
    INTERNET: 2,
    DVBT: 3,
    DVBS: 4
};

/**
 * @name Language
 * @desc Language of menu, subttitles and audio.
 * See values-language.h:
 * ENUM_SL2_TVAPI_INT32_LANGUAGE
 * @example
 * Language.GERMAN
 * Language.ENGLISH
 * Language.FRENCH
 * Language.ITALIAN
 * Language.SPANISH
 * Language.NETHERLANDS
 * Language.CZECH
 * Language.GREEK
 * Language.POLISH
 * Language.HUNGARIAN
 * Language.FINNISH
 * Language.SLOVENIAN
 * Language.SLOVAK
 * Language.TURKISH
 * Language.SWEDISH
 * Language.DANISH
 * Language.PORTUGUESE
 * Language.RUSSIAN
 * Language.NORWEGIAN
 * Language.CHINESE
 * Language.LATVIAN
 * Language.LITHUANIAN
 * Language.ESTONIAN
 * Language.UKRAINIAN
 * Language.ROMANIAN
 * Language.BYELORUSSIAN
 * Language.SERBIAN
 * Language.CROATIAN
 * Language.JAPANESE
 * Language.IRISH
 * Language.WELSH
 * Language.CATALAN
 * Language.GAELIC
 * Language.BASQUE
 * Language.GALICIAN
 * Language.SCOTS
 * Language.BRETON
 * Language.CORSICAN
 * Language.ALEMANNIC
 * Language.BULGARIAN
 * Language.ARABIC
 * Language.WALLOON
 * Language.LUXEMBOURGISH
*/
var Language = {
    GERMAN: 0,
    ENGLISH: 1,
    FRENCH: 2,
    ITALIAN: 3,
    SPANISH: 4,
    NETHERLANDS: 5,
    CZECH: 6,
    GREEK: 7,
    POLISH: 8,
    HUNGARIAN: 9,
    FINNISH: 10,
    SLOVENIAN: 11,
    SLOVAK: 12,
    TURKISH: 13,
    SWEDISH: 14,
    DANISH: 15,
    PORTUGUESE: 16,
    RUSSIAN: 17,
    NORWEGIAN: 18,
    CHINESE: 19,
    LATVIAN: 20,
    LITHUANIAN: 21,
    ESTONIAN: 22,
    UKRAINIAN: 23,
    ROMANIAN: 24,
    BYELORUSSIAN: 25,
    SERBIAN: 26,
    CROATIAN: 27,
    JAPANESE: 28,
    IRISH: 29,
    WELSH: 30,
    CATALAN: 31,
    GAELIC: 32,
    BASQUE: 33,
    GALICIAN: 34,
    SCOTS: 35,
    BRETON: 36,
    CORSICAN: 37,
    ALEMANNIC: 38,
    BULGARIAN: 39,
    ARABIC: 40,
    WALLOON: 41,
    LUXEMBOURGISH: 42
};

/**
 * @name SubtitleMode
 * @desc Subtitles mode.
 * See values-basic-settings.h:
 * ENUM_SL2_TVAPI_I32_BASIC_SETTINGS_ENUM_DVB_SUBTITLE_MODE
 * @example
 * SubtitleMode.OFF,
 * SubtitleMode.ON,
 * SubtitleMode.IMPAIRED
*/
var SubtitleMode = {
    OFF: 0,
    ON: 1,
    IMPAIRED: 2
};

/**
 * @name EPG
 * @desc EPG table fields
 * See values-epg.h:
 * ENUM_SL2_TVAPI_EPG_FIELD
 * @example
 * EPG.SID,
 * EPG.TSID,
 * EPG.ONID,
 * EPG.EID,
 * EPG.TITLE,
 * EPG.SHORT_TEXT,
 * EPG.DESCRIPTION,
 * EPG.START_TIME,
 * EPG.END_TIME,
 * EPG.RUNNING_STATE,
 * EPG.FREE_CAMODE,
 * EPG.RATING,
 * EPG.THEMES,
 * EPG.CRIDS,
 * EPG.SERVICE_NAME,
 * EPG.SERVICE_THUMBNAIL,
 * EPG.SERVICE_LINK,
 * EPG.SERVICE_ATTRIBUTES,
 * EPG.SERVICE_FAVORITE_NO,
 * EPG.SERVICE_SERVICE_UUID,
 * EPG.TIMER_LIST_ENTRY_RECORDING_UUID,
 * EPG.TIMER_LIST_ENTRY_MEMORIZED_UUID,
 * EPG.LINKAGE
*/
var EPG = {
    SID: 2000,
    TSID: 2001,
    ONID: 2002,
    EID: 2003,
    TITLE: 2004,
    SHORT_TEXT: 2005,
    DESCRIPTION: 2006,
    START_TIME: 2007,
    END_TIME: 2008,
    RUNNING_STATE: 2009,
    FREE_CAMODE: 2010,
    RATING: 2011,
    THEMES: 2012,
    CRIDS: 2013,
    SERVICE_NAME: 2014,
    SERVICE_THUMBNAIL: 2015,
    SERVICE_LINK: 2016,
    SERVICE_ATTRIBUTES: 2017,
    SERVICE_FAVORITE_NO: 2018,
    SERVICE_SERVICE_UUID: 2019,
    TIMER_LIST_ENTRY_RECORDING_UUID: 2020,
    TIMER_LIST_ENTRY_MEMORIZED_UUID: 2021,
    LINKAGE: 2022
};

/**
 * @name SL_Fields
 * @desc ServiceList fields.
 * See values-servicelist.h:
 * ENUM_SL2_TVAPI_TABLE_SERVICELIST_LIST_FIELDS
 * @example
 * SL_Fields.SERVICE_NAME,
 * SL_Fields.SERVICE_LIST_UUID,
 * SL_Fields.SERVICE_URI,
 * SL_Fields.ATTRIBUTES,
 * SL_Fields.FRONTEND,
 * SL_Fields.SATELLITE,
 * SL_Fields.CHANNEL_NUMBER,
 * SL_Fields.SERVICE_UUID,
 * SL_Fields.SID,
 * SL_Fields.TSID,
 * SL_Fields.ONID,
 * SL_Fields.PRESENT_EVENT_START,
 * SL_Fields.PRESENT_EVENT_STOP,
 * SL_Fields.PRESENT_EVENT_NAME,
 * SL_Fields.PRESENT_EVENT_SHORTINFO,
 * SL_Fields.PRESENT_EVENT_LONGINFO,
 * SL_Fields.FOLLOWING_EVENT_START,
 * SL_Fields.FOLLOWING_EVENT_STOP,
 * SL_Fields.FOLLOWING_EVENT_NAME,
 * SL_Fields.FOLLOWING_EVENT_SHORTINFO,
 * SL_Fields.FOLLOWING_EVENT_LONGINFO,
 * SL_Fields.MEDIA_TYPE,
 * SL_Fields.MEDIA_SUBTYPE,
 * SL_Fields.CNI,
 * SL_Fields.SERVICE_VISIBLE,
 * SL_Fields.SERVICE_SELECTABLE,
 * SL_Fields.CISLOT_CONFIG,
 * SL_Fields.TTX_PREVIEW_PAGE,
 * SL_Fields.TTX_SUBTITLE_PAGE,
 * SL_Fields.TTX_ENCODING,
 * SL_Fields.ORIGINAL_ANCESTOR_UUID,
 * SL_Fields.ORIGINAL_UUID,
 * SL_Fields.ORIGINAL_LCN,
 * SL_Fields.HEX_TRIPLET,
 * SL_Fields.FREQUENCY,
 * SL_Fields.TUNER_SERVICE_UUID,
 * SL_Fields.THUMBNAIL_URL
 */
var SL_Fields = {
    SERVICE_NAME: 0,
    SERVICE_LIST_UUID: 1,
    SERVCIE_URI: 2,
    ATTRIBUTES: 3,
    FRONTEND: 4,
    SATELLITE: 5,
    CHANNEL_NUMBER: 6,
    SERVICE_UUID: 7,
    SID: 8,
    TSID: 9,
    ONID: 10,
    PRESENT_EVENT_START: 11,
    PRESENT_EVENT_STOP: 12,
    PRESENT_EVENT_NAME: 13,
    PRESENT_EVENT_SHORTINFO: 14,
    PRESENT_EVENT_LONGINFO: 15,
    FOLLOWING_EVENT_START: 16,
    FOLLOWING_EVENT_STOP: 17,
    FOLLOWING_EVENT_NAME: 18,
    FOLLOWING_EVENT_SHORTINFO: 19,
    FOLLOWING_EVENT_LONGINFO: 20,
    MEDIA_TYPE: 21,
    MEDIA_SUBTYPE: 22,
    CNI: 23,
    SERVICE_VISIBLE: 24,
    SERVICE_SELECTABLE: 25,
    CISLOT_CONFIG: 26,
    TTX_PREVIEW_PAGE: 27,
    TTX_SUBTITLE_PAGE: 28,
    TTX_ENCODING: 29,
    ORIGINAL_ANCESTOR_UUID: 30,
    ORIGINAL_UUID: 31,
    ORIGINAL_LCN: 32,
    HEX_TRIPLET: 33,
    FREQUENCY: 34,
    TUNER_SERVICE_UUID: 35,
    THUMBNAIL_URL: 36
};

/**
 * @name SL_Attributes
 * @desc ServiceList attributes.
 * See values-servicelist.h:
 * ENUM_SL2_TVAPI_TABLE_SERVICELIST_FILTERVALUES_ATTRIBUTES
 * @example
 * SL_Attributes.ENCRYPTED,
 * SL_Attributes.CIPLUS,
 * SL_Attributes.HD,
 * SL_Attributes.ACQ,
 * SL_Attributes.PARENTAL_LOCK,
 * SL_Attributes.GAMING_MODE,
 * SL_Attributes.HBBTV_MANUAL,
 * SL_Attributes.NEW,
 * SL_Attributes.NOMOREFOUND,
 * SL_Attributes.NOT_DELETED,
 * SL_Attributes.LOCKED,
 * SL_Attributes.CISLOT,
 * SL_Attributes.TTX_PREVIEW_PAGE,
 * SL_Attributes.TTX_SUBTITLE_PAGE,
 * SL_Attributes.TTX_CHAR_ENCRYPTION,
 * SL_Attributes.LCN_CONFLICT,
 * SL_Attributes.STREAMABLE
 */
var SL_Attributes = {
    ENCRYPTED: 1,
    CIPLUS: 2,
    HD: 4,
    ACQ: 8,
    PARENTAL_LOCK: 16,
    GAMING_MODE: 32,
    HBBTV_MANUAL: 64,
    NEW: 128,
    NOMOREFOUND: 256,
    NOT_DELETED : 512,
    LOCKED: 1024,
    CISLOT: 2048,
    TTX_PREVIEW_PAGE: 4096,
    TTX_SUBTITLE_PAGE: 8192,
    TTX_CHAR_ENCRYPTION: 16384,
    LCN_CONFLICT: 32768,
    NEW_LCN_CONFLICT: 65536,
    STREAMABLE: 131072
};

/**
 * @name AgeRelatedLock
 * @desc Possible types of age-related lock.
 * @example
 * AgeRelatedLock.DEACTIVATED,
 * AgeRelatedLock.ACTIVATED,
 * AgeRelatedLock.ALWAYS_BLOCKED,
 */
var AgeRelatedLock = {
	DEACTIVATED: 0,
	ACTIVATED: 1,
	ALWAYS_BLOCKED: 2
};

/**
 * @name ListStreamingParameters
 * @desc List of possible streaming parameters in URI
 */
var ListStreamingParameters = [
	"frontend",
	"satid",
	"frequency",
	"modulation",
	"symbolrate",
	"bandwidth",
	"coderate",
	"plpid",
	"datasliceid",
	"inversion",
	"polarization",
	"band",
	"modcod",
	"dvbtpriority",
	"onid",
	"sid",
	"tsid"
];

/**
 * @name DIR_Fields
 * @desc Directory fields.
 * See values-directory.h:
 * ENUM_SL2_TVAPI_TABLE_DIRECTORY
 * @example
 * DIR_Fields.ANCESTOR,
 * DIR_Fields.CAPTION,
 * DIR_Fields.TYPE,
 * DIR_Fields.SUBTYPE,
 * DIR_Fields.LOCATOR,
 * DIR_Fields.THUMBNAIL_URL,
 * DIR_Fields.TITLE,
 * DIR_Fields.ARTIST,
 * DIR_Fields.ALBUM,
 * DIR_Fields.GENRE,
 * DIR_Fields.DATE,
 * DIR_Fields.ACTOR,
 * DIR_Fields.DIRECTOR,
 * DIR_Fields.PLAYTIME,
 * DIR_Fields.INDEX,
 * DIR_Fields.ATTRIBUTES,
 * DIR_Fields.FILE_SIZE,
 * DIR_Fields.COMMENT,
 * DIR_Fields.DESCRIPTION,
 * DIR_Fields.NEWS,
 * DIR_Fields.UUID,
 * DIR_Fields.LONG_INFO,
 * DIR_Fields.START_TIME,
 * DIR_Fields.MAX_POS,
 * DIR_Fields.RESOLUTION,
 * DIR_Fields.VOLUME_ID,
 * DIR_Fields.UNIQUE,
 * DIR_Fields.TRACK_NUMBER,
 * DIR_Fields.IS_ACTIVE,
 * DIR_Fields.ORIGINAL_UUID,
 * DIR_Fields.ORIGINAL_VOLUME_ID,
 * DIR_Fields.STATION_NAME,
 * DIR_Fields.DATE_NUMERIC,
 * DIR_Fields.ALBUM_UUID,
 * DIR_Fields.EVENT_TAG
 */
var DIR_Fields = {
	ANCESTOR: 0,
	CAPTION: 1,
	TYPE: 2,
	SUBTYPE: 3,
	LOCATOR: 4,
	THUMBNAIL_URL: 5,
	TITLE: 6,
	ARTIST: 7,
	ALBUM: 8,
	GENRE: 9,
	DATE: 10,
	ACTOR: 11,
	DIRECTOR: 12,
	PLAYTIME: 13,
	INDEX: 14,
	ATTRIBUTES: 15,
	FILE_SIZE: 16,
	COMMENT: 17,
	DESCRIPTION: 18,
	NEWS: 19,
	UUID: 20,
	LONG_INFO: 21,
	START_TIME: 22,
	MAX_POS: 23,
	RESOLUTION: 24,
	VOLUME_ID: 25,
	UNIQUE: 26,
	TRACK_NUMBER: 27,
	IS_ACTIVE: 28,
	ORIGINAL_UUID: 29,
	ORIGINAL_VOLUME_ID: 30,
	STATION_NAME: 31,
	DATE_NUMERIC: 32,
	ALBUM_UUID: 33,
	EVENT_TAG: 34
};

/**
 * @name DVB character set
 * @desc DVB_CHARSET Fields
 * See values-basic-settings.h:
 * ENUM_SL2_TVAPI_I32_BASIC_SETTINGS_ENUM_DVB_CHARSET
 * @example
 * DVB_CHARSET.WESTERN_EUROPEAN,
 * DVB_CHARSET.STANDARD,
 * DVB_CHARSET.POLISH,
 * DVB_CHARSET.GREEK,
 * DVB_CHARSET.TURKISH,
 * DVB_CHARSET.CHINESE,
**/


var DVB_CHARSET = {

    WESTERN_EUROPEAN: 0,
    STANDARD: 1,
    POLISH: 2,
    GREEK: 3,
    TURKISH: 4,
    CHINESE: 5

};

init = function()
{
    YES                      = YES;
    NO                       = NO;
    DO_NOT_CHANGE            = DO_NOT_CHANGE;
    DO_NOT_CHECK             = DO_NOT_CHECK;
    Location                 = Location;
    Source                   = Source;
    Operator                 = Operator;
    Modulation               = Modulation;
    Voltage                  = Voltage;
    SearchMethod             = SearchMethod;
    Time                     = Time;
    MediaType                = MediaType;
    UpdateType               = UpdateType;
    SearchState              = SearchState;
    Key                      = Key;
    ScanError                = ScanError;
    Message                  = Message;
    OSDcontrol               = OSDcontrol;
    DCMflow                  = DCMflow;
    SatScheme                = SatScheme;
    SatBand                  = SatBand
    Band                     = Band;
    Satellite                = Satellite;
    UpdateSource             = UpdateSource;
    Language                 = Language;
    SubtitleMode             = SubtitleMode;
    EPG                      = EPG;
    SL_Fields                = SL_Fields;
    SL_Attributes            = SL_Attributes;
    AgeRelatedLock           = AgeRelatedLock;
    ListStreamingParameters  = ListStreamingParameters;
    DIR_Fields               = DIR_Fields;
    DVB_CHARSET              = DVB_CHARSET;
};
