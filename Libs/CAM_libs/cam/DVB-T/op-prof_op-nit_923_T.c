/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


/* op_nit_2000_T */
uint8 op_nit_2000_T[45] = {
0x40,0xF0,0x2E,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0x1B,0x00,0x01,
0x00,0x85,0xF0,0x15,0x5A,0x0B,0x02,0xD3,0x44,0x40,0x1F,0x80,0x0A,0xFF,0xFF,0xFF,0xFF,0x41,0x06,0x00,
0x01,0x01,0x00,0x02,0x01
};



int main(void)
{
   uint32 eError;
   cit_op_OperatorStatusBody stStatusBody_now;
   cit_op_OperatorStatusBody stStatusBody_after;
   uint8 u8NitVersion;
   cit_op_BigNitBuffer stNitBuffer_now;
   cit_op_NitBuffer stNitBuffer_after;
   cit_op_OperatorInfo stOpInfo;
   uint8 op_tune_0000_X[2] = {0xF0, 0x00};
   uint8 *pu8OperatorProfileName = "DTVL_Profile_0";

   printf("[BOLD]OP op-prof_op-nit_923_T Start \n");   
   

   /* status_body_0901_T */
   stStatusBody_now.u8InfoVersion = 0;
   stStatusBody_now.u8NitVersion  = 1;
   stStatusBody_now.u8ProfileType = 0x1;
   stStatusBody_now.u8InitialisedFlag = 0x1;
   stStatusBody_now.u8EntChangeFlag  = 0x0;
   stStatusBody_now.u8EntValidFlag  = 0x1;
   stStatusBody_now.u8RefreshRequestFlag  = 0x0;
   stStatusBody_now.u8ErrorFlag  = 0x0;
   stStatusBody_now.u8DeliverySystemHint  = 0x4;
   stStatusBody_now.u16RefreshRequestDate = 0x0000;
   stStatusBody_now.u8RefreshRequestTime = 0x00;   
   /* set status_buffer_now */
   cit_op_SetOperatorStatusNow(&stStatusBody_now);

   /* set status_buffer_after_search */
   cit_op_SetOperatorStatusAfterSearch(&stStatusBody_now);
   
   cit_op_CalculateCrc(FALSE);
   /* set DVB-T Big Nit Buffer from CICAM MFS  */   
   stNitBuffer_now.pu8NitBuffer = NULL;
   strncpy(stNitBuffer_now.au8NitLabel, "op_nit_9022_T", 16); /* set nit_label */
   stNitBuffer_now.au8NitLabel[16] = '\0';
   stNitBuffer_now.u16NitSize = 0;   
   stNitBuffer_now.eDeliverySystemDesc = DELIVERY_T;
   cit_op_SetBigCicamNit(&stNitBuffer_now);
   
   /* op_nit_2000_T */
   u8NitVersion = 1; /* +1 already done above */
   memcpy(stNitBuffer_after.au8NitBuffer, op_nit_2000_T, sizeof(op_nit_2000_T));
   stNitBuffer_after.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer_after.au8NitLabel, "op_nit_2000_T", 16); /* set nit_label */
   stNitBuffer_after.au8NitLabel[16] = '\0';
   stNitBuffer_after.u16NitSize = sizeof(op_nit_2000_T);   
   /* set nit_buffer_after_search */
   cit_op_SetNitBufferAfterSearch(&stNitBuffer_after);

   /* op_info_0001 */  
   stOpInfo.u8InfoValid = 0x1;
   stOpInfo.u8InfoVersion = 0x0;
   stOpInfo.u16OrigNetID = 0x0085;
/* stOpInfo.u32Identifier - set by CAM code */
   stOpInfo.u8CharCodeTable = 0x00;
/* stOpInfo.u8EncodingTypeID - n/a
   stOpInfo.u8SecondByteValue - n/a
   stOpInfo.u8ThirdByteValue - n/a */
   stOpInfo.u8SdtRunStatTrusted = 0x0;
   stOpInfo.u8EitRunStatTrusted = 0x0;
   stOpInfo.u8EitPresentFollUsage = 0x1;
   stOpInfo.u8EitScheduleUsage = 0x1;
   stOpInfo.u8ExtendedEventUsage = 0x0;
   stOpInfo.u8SdtOtherTrusted = 0x0;
   stOpInfo.u8EitEventTrigger = 0x1;
   stOpInfo.u32Iso639LangCode = 0x756E64;
   stOpInfo.u8ProfileNameLen = 0x14;
   strcpy(stOpInfo.au8ProfileName, "Initial_DTVL_Profile");
/* stOpInfo.au8ProfileName  - n/a */
   /* set operator_info */ 
   cit_op_SetOperatorInfo(&stOpInfo);


   /* set empty delivery system descriptor loop - op_tune_0000_X  */
   cit_op_SetDeliveryDscrLoop(op_tune_0000_X);

   cit_op_EnableDisableOpResource(1);

   /* send unsolicited operator_status APDU */
   eError = cit_op_SendOperatorStatus();
   if(0 != eError)
   {
      printf("[BOLD]Send Operator Status eError: %d \n", eError); 
   }
   printf("[BOLD]OP script done\n"); 
   return 0;
}

main(); 


 
