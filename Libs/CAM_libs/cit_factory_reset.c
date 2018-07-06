/* -------------------------------------------------------------------------- */
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* -------------------------------------------------------------------------- */
#include <picoc_cit.h>

int enable_all_logs(uint8 u8Enable)
{
   uint32 eError;

   
   /* Enable HC log */
   cit_hc_EnableLogs(u8Enable); 
   
   /* Enable LSC log */
   if(u8Enable)
   {
      cit_lsc_SetLogState(LOG_GENERAL_ENABLE | LOG_COMMS_REPLY_ENABLE | LOG_COMMS_RECV_ENABLE, 
	                      LOG_GENERAL_MASK | LOG_COMMS_REPLY_MASK | LOG_COMMS_RECV_MASK);
   }
   else
   {
      cit_lsc_SetLogState(0, 
	                      LOG_GENERAL_MASK | LOG_COMMS_REPLY_MASK | LOG_COMMS_RECV_MASK);
   }
   
   /* Enable LICENCE log */
   eError = cit_lic_WriteModuleConfig(u8Enable, 0x00);
   if(eError != 0)
   {
     printf("LIC log enabling failed \n");
   }
   
   /* Enable PIN log */
   eError = cit_pin_SetLogConfig(u8Enable);
   if(eError != 0)
   {
      printf("PIN log enabling failed \n"); 
   }

    /* enable OP log */
	 eError = cit_op_SetLogConfig(1);
	 if(eError != 0)
   {
      printf("OP log enabling failed \n"); 
   }
   
   printf("[BOLD]   Enabling All Logs\n");       
   return 0;
}

int disable_debug_text()
{
   char   *module       = "rsc_cc";
   uint32 u32DebugLevel = 0x03;  /*the minimum default trace level*/
   uint32 eError;
   
   eError = debug_set_level(module, u32DebugLevel);
   if(eError != 0)
   {
      printf("Failed to set debug level \n");
   }

   printf("[BOLD]   Debug trace levels set\n");
   return 0;
}

int reset_internal_clock()
{
   uint32 eError;
     
   
   eError = cit_sys_ResetInternalTime();
   if(eError != 0)
   {
      printf("cit_sys_ResetInternalTime() failed \n");
   }

   printf("[BOLD]   Reset Internal Clock\n");
   return 0;
}

int cc_factory_reset()
{
   uint32 eError = 0;
   
   eError = cit_SetCCApduLength(0x00);
   if (0 != eError)
   {
      printf("Failed to set default CC APDU length_field\n");
   }
   
   eError = cit_cc_SetCcApduSendFlag(1);
   if (0 != eError)
   {
      printf("Failed to set SetCcApduSend flag\n");
   }
   
   eError = cit_cc_SetCcSystemIdBitmask(1);
   if (0 != eError)
   {
      printf("Failed to set SetCcSystemIdBitmask\n");
   }
   
   eError = cit_nvram_SetResourceVersion(CIT_RSC_INDEX_CONTENT_CONTROL, 0x008C1002);
   if(eError != 0)
   {
      printf("Failed to to set resource version \n");
   }
 
   uint8  u8UriMessage[8] = {0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}; /* Set up use case 2 (copy freely) URIv2 */

   /* Set URI use case */
   eError = cit_uri_SetURIMessageFromBuffer(u8UriMessage);
   if(eError != 0)
   {
      printf("Test failed to set URI from script, eError: %d \n", eError);
      return 0;
   }

	/* Save the URI use case to use at service change */
   eError = cit_uri_SaveDefaultPrgURI();
   if(eError != 0)
   {
      printf("Failed to set next channel change URI, eError: %d \n", eError);
   }

	/* Save the URI use case to NVRAM to use at next CAM bootup */
   eError = cit_uri_SaveDefaultURI();
   if(eError != 0)
   {
      printf("Failed to save URI message in NVRAM, eError: %d \n", eError);
   }
   
   printf("[BOLD]   CC Factory Reset\n");    
   return 0;
}

int hc_factory_reset()
{
   uint32 eError = 0;
   
   
   eError = cit_nvram_SetResourceVersion(CIT_RSC_INDEX_HOST_CONTROL, 0x00200042);  /* 9.1 [3:1] */
 
   if(eError != 0)
   {
      printf("Failed to to set resource version \n");
   }
  
   eError = cit_hc_SetTunerReleaseAckResponse(0); /* 9.1 [3:6] - 0x01 (Release refused) */
   if(eError != 0)
   {
      printf("Failed to to set Release Ack Response \n");
   }

   printf("[BOLD]   HC Factory Reset\n"); 
   return 0;
}

int mheg_factory_reset()
{
   uint32 eError = 0;
   
   
   eError = cit_nvram_SetResourceVersion(CIT_RSC_INDEX_APPMMI, 0x00410041);    /* 9.1 [5:2] */
 
   if(eError != 0)
   {
      printf("Failed to to set resource version \n");
   }
   
   eError = cit_nvram_mheg_SetSSMValue(3); /* 9.1 [5.3] - No SSM */
   if(eError != 0)
   {
      printf("Failed to to set SSM value \n");
   }
   


   printf("[BOLD]   MHEG Factory Reset\n"); 
   return 0;
}

int lic_factory_reset()
{
   uint32 eError = 0;

   
   eError = cit_lic_InitialiseNvram(); /* 9.1 [6:1] [6:11] [6:12] [6:13] [6:14]  */
   if(eError != 0)
   {
      printf("cit_lic_InitialiseNvram() failed \n");
   }
  
   printf("[BOLD]   License Factory Reset\n"); 
   return 0;
}


int pin_factory_reset()
{
   uint32 eError;
   uint8  u8Capabilitiy = 0x0;
   uint8  u8Rating = 0x0;
   uint8  u8Delay = 0;
   uint8  *u8Pin ="1234";
   uint8  u8Status = 0x02;
   uint8  u8PinEntryRequest = 0x01;
   uint8 u8PrivateData[15];
   uint8 u8Module = CIT_HR_REGISTER_NONE;

   memcpy(u8PrivateData, 0x00, sizeof(u8PrivateData));


   eError = cit_nvram_Write (&u8Capabilitiy, CIT_NVRAM_OFFSET_PIN_CAPABILITY, 1);
   if (0 != eError)
   {
      printf("failed to write PIN Capability\n"); 
   }   

   eError = cit_nvram_Write (&u8Rating, CIT_NVRAM_OFFSET_PIN_CAM_RATING, 1);
   if (0 != eError)
   {
      printf("failed to write PIN CAM Rating\n"); 
   }
   
   eError = cit_nvram_Write (u8Pin, CIT_NVRAM_OFFSET_PIN_CAM_PIN, 5);
   if(0 != eError)
   {
      printf("failed to write PIN Code\n"); 
   }   

   eError = cit_nvram_Write (&u8Delay, CIT_NVRAM_OFFSET_PIN_DELAY, 1);
   if(0 != eError)
   {
      printf("failed to write PIN Reply Delay\n"); 
   }
   
   eError = cit_nvram_Write (&u8Status, CIT_NVRAM_OFFSET_PIN_STATUS, 1);
   if(0 != eError)
   {
      printf("failed to write PIN Status\n", eError); 
   }
   
   eError = cit_nvram_Write (&u8PinEntryRequest, CIT_NVRAM_OFFSET_PIN_ENTRY_REQUEST, 1);
   if(0 != eError)
   {
      printf("failed to write PIN Entry Request\n", eError); 
   }
   
   eError = cit_nvram_Write (u8PrivateData, CIT_NVRAM_OFFSET_PIN_PRIVATE_DATA, sizeof(u8PrivateData));
   if(0 != eError)
   {
      printf("failed to write PIN Private Data\n", eError); 
   }

   eError = cit_nvram_Write(&u8Module, CIT_NVRAM_OFFSET_HR_REGISTER, sizeof(u8Module));
   if(0 != eError)
   {
      printf("failed to write PIN Private Data\n", eError); 
   }
   
   printf("[BOLD]   Pin Factory Reset\n");    
   return 0;
}


int op_factory_reset()
{
   uint32 eError;
   uint8  u8TuneLabel[CIT_OP_TUNE_LABEL_SIZE];
   uint32 u32CicamId          = 0x00000000;


   
   uint8 CisData[152];
   
   cit_op_CalculateCrc(TRUE);
   
   memcpy(u8TuneLabel, 0x00, sizeof(u8TuneLabel));

   /* Reset CIS (use perso CIS) */
   eError = cit_sys_SetAppCIS(CisData, 0); 
   if(0 != eError)
   {
      printf("[BOLD]Set App CIS eError: %d \n", eError); 
   }
   
   eError = cit_nvram_Write ((void *)&u32CicamId, CIT_NVRAM_OFFSET_OP_SET_CICAM_ID, 4);
   if(0 != eError)
   {
      printf("Failed to write CicamID\n");
   }

   eError = cit_nvram_Write (u8TuneLabel, CIT_NVRAM_OFFSET_OP_TUNE_LABEL, CIT_OP_TUNE_LABEL_SIZE);
   if(0 != eError)
   {
      printf("failed to erase the Tune Label zone \n", eError); 
   }

   cit_op_EnableDisableOpResource(0);

   printf("[BOLD]   OP Factory Reset\n");
   return 0;
}

int lsc_factory_reset(void)
{
   uint32 eError;
   uint8  u8ProtocolVersion   = 0x01;
   uint8  *pu8IpAddress       = "192.168.000.001";
   uint16 u16DestinationPort  = 0x0050;
   uint8  u8ProtocolType      = 0x01;
   uint8  u8RetryCount        = 0x00;
   uint8  u8ConnectionTimeout = 0x05;
   uint16 u16BufferSize       = 0x00FE;
   uint8  u8ReceptionTimeout  = 0x0A;
   uint8  u8CommsPhaseId      = 0x0F;
   uint16 u16CommsReplyCnt    = 0x0000;
   uint16 u16CommsRcvCnt      = 0x0000;

   eError = cit_nvram_Write (&u8ProtocolVersion, CIT_NVRAM_OFFSET_LSC_PROTO_VERSION, 1);
   if (0 != eError)
   {
      printf("Failed to write protocol_version\n");
   }

   eError = cit_nvram_Write (pu8IpAddress, CIT_NVRAM_OFFSET_LSC_IP_ADDRESS, 16);
   if (0 != eError)
   {
      printf("Failed to write ip_address\n");
   }

   eError = cit_nvram_Write (&u8ProtocolType, CIT_NVRAM_OFFSET_LSC_PROTO_TYPE, 1);
   if (0 != eError)
   {
      printf("Failed to write protocol_type\n");
   }

   eError = cit_nvram_Write (&u8RetryCount, CIT_NVRAM_OFFSET_LSC_RETRY_COUNT, 1);
   if (0 != eError)
   {
      printf("Failed to write retry_count\n");
   }

   eError = cit_nvram_Write (&u8ConnectionTimeout, CIT_NVRAM_OFFSET_LSC_CONN_TIMEOUT, 1);
   if (0 != eError)
   {
      printf("Failed to write connection_timeout\n");
   }

   eError = cit_nvram_Write ((void *)&u16BufferSize, CIT_NVRAM_OFFSET_LSC_BUFFER_SIZE, 2);
   if(0 != eError)
   {
      printf("Failed to write buffer_size\n");
   }

   eError = cit_nvram_Write (&u8ReceptionTimeout, CIT_NVRAM_OFFSET_LSC_RECEP_TIMEOUT, 1);
   if(0 != eError)
   {
      printf("Failed to write reception_timeout\n");
   }

   eError = cit_nvram_Write (&u8CommsPhaseId, CIT_NVRAM_OFFSET_LSC_COMMS_PHASE_ID, 1);
   if(0 != eError)
   {
      printf("Failed to write comms_phase_id\n");
   }

   eError = cit_nvram_Write ((void *)&u16CommsReplyCnt, CIT_NVRAM_OFFSET_LSC_COMMS_RPLY_CNT, 2);
   if(0 != eError)
   {
      printf("Failed to write comms_reply_counter\n");
   }

   eError = cit_nvram_Write ((void *)&u16CommsRcvCnt, CIT_NVRAM_OFFSET_LSC_COMMS_RCV_CNT, 2);
   if(0 != eError)
   {
      printf("Failed to write comms_rcv_counter\n");
   }
   
   printf("[BOLD]   Lsc Reset\n");   
   return 0;
}

int scheduler_reset(void)
{
   uint32 eError;

   eError = cit_cmd_scheduler_CommandTableNew(); /* 9.1 [6:4] [7:7] & [7:13] */
   if(eError != 0)
   {
      printf("Failed to clear commands in Scheduler \n");
   }
  
   printf("[BOLD]   Scheduler Reset\n");   
   return 0;
}

int main(void)
{ 
   cit_sys_SetCiV1Mode(0);
   
   reset_internal_clock();
   
   cc_factory_reset();
   hc_factory_reset();
   mheg_factory_reset();
    
   lic_factory_reset();
   pin_factory_reset();
   op_factory_reset();
   lsc_factory_reset();
   
   scheduler_reset();
   
   enable_all_logs(1);
   disable_debug_text(); /*Disable rsc_cc traces*/
   
   cit_nvram_mheg_SetLogConfig(0); /* Log disabled */
   cit_nvram_mheg_SetMode(1); /* Normal Mode 1 */
   
   printf("[BOLD] Factory RESET\n");   
  
   return 0;
}

main(); 
