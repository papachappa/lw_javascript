/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


/* op_nit_0102_C */
uint8 op_nit_0102_C[171] = {
0x40,0xF0,0xAC,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0x99,0x00,0x01,
0x00,0x85,0xF0,0x57,0x44,0x0B,0x04,0x74,0x00,0x00,0xFF,0xF2,0x05,0x00,0x68,0x75,0x0F,0x5F,0x04,0x00,
0x00,0x00,0x40,0xCC,0x1F,0x00,0x01,0x01,0xC0,0x65,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,
0x69,0x6C,0x65,0x5F,0x30,0x0A,0x43,0x41,0x4D,0x5F,0x30,0x31,0x5F,0x46,0x54,0x41,0xCC,0x21,0x00,0x02,
0x01,0xC0,0x66,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,0x69,0x6C,0x65,0x5F,0x30,0x0C,0x43,
0x41,0x4D,0x5F,0x30,0x32,0x5F,0x53,0x63,0x72,0x61,0x6D,0x00,0x03,0x01,0x37,0xF0,0x36,0x44,0x0B,0x05,
0x06,0x00,0x00,0xFF,0xF2,0x05,0x00,0x68,0x75,0x0F,0x5F,0x04,0x00,0x00,0x00,0x40,0xCC,0x21,0x00,0x09,
0x01,0xC0,0x67,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,0x69,0x6C,0x65,0x5F,0x30,0x0C,0x43,
0x41,0x4D,0x5F,0x30,0x33,0x5F,0x53,0x63,0x72,0x61,0x6D
};


int main(void)
{
   uint32 eError;
   cit_op_OperatorStatusBody stStatusBody_now;
   cit_op_OperatorStatusBody stStatusBody_after;
   uint8 u8NitVersion;
   cit_op_NitBuffer stNitBuffer;
   cit_op_OperatorInfo stOpInfo;
   uint8 op_tune_0000_X[2] = {0x00, 0x00};


   printf("[BOLD]OP op-prof_op-status_602_C Start \n");


   /* status_body_0603_C */
   stStatusBody_now.u8InfoVersion = cit_op_GetInfoVersion() + 1;
   stStatusBody_now.u8NitVersion = cit_op_GetNitVersion() + 0;
   stStatusBody_now.u8ProfileType = 0x1;
   stStatusBody_now.u8InitialisedFlag = 0x1;
   stStatusBody_now.u8EntChangeFlag = 0x0;
   stStatusBody_now.u8EntValidFlag = 0x1;
   stStatusBody_now.u8RefreshRequestFlag = 0x0;
   stStatusBody_now.u8ErrorFlag = 0x0;
   stStatusBody_now.u8DeliverySystemHint = 0x7;
   stStatusBody_now.u16RefreshRequestDate = 0x0000;
   stStatusBody_now.u8RefreshRequestTime = 0x00;      
   /* set status_buffer_now */
   cit_op_SetOperatorStatusNow(&stStatusBody_now);

   /* set status_buffer_after_search */
   cit_op_SetOperatorStatusAfterSearch(&stStatusBody_now);


   /* op_nit_0102_C */
   u8NitVersion = stStatusBody_now.u8NitVersion; /* +0 already done above */
   memcpy(stNitBuffer.au8NitBuffer, op_nit_0102_C, sizeof(op_nit_0102_C));
   stNitBuffer.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer.au8NitLabel, "op_nit_0102_C", 16); /* set nit_label */
   stNitBuffer.au8NitLabel[16] = '\0';
   stNitBuffer.u16NitSize = sizeof(op_nit_0102_C);
   /* set nit_buffer_now */
   cit_op_SetNitBufferNow(&stNitBuffer);
   /* set nit_buffer_after_search */
   cit_op_SetNitBufferAfterSearch(&stNitBuffer);


 
   /* op_info_0602 */  
   stOpInfo.u8InfoValid = 0x1;
   stOpInfo.u8InfoVersion = stStatusBody_now.u8InfoVersion; /* +1 already done above */
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
   stOpInfo.u8ProfileNameLen = 0x0E;
   strcpy(stOpInfo.au8ProfileName, "1_DTVL_Profile");
   /* set operator_info */  
   cit_op_SetOperatorInfo(&stOpInfo);


   /* set empty delivery system descriptor loop - op_tune_0000X  */
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


 
