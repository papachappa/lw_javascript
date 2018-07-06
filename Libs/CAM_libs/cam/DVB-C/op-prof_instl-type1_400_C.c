/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


/* op_nit_0000_C */
uint8 op_nit_0000_C[48] = {
0x40,0xF0,0x31,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0x1E,0x00,0x01,
0x00,0x85,0xF0,0x18,0x41,0x09,0x00,0x01,0x01,0x00,0x02,0x01,0x00,0x03,0x01,0x44,0x0B,0x04,0x74,0x00,
0x00,0xFF,0xF2,0x05,0x00,0x68,0x75,0x0F
};


/* CIS string = $compatible[ciplus=1 ciprof=0x00000001]$ */
uint8 CisData[170] =
{
	/* CISTPL_DEVICE_OA - L=6 */
	0x1D, 0x04, 0x00, 0xDB, 0x08, 0xFF,

	/* CISTPL_DEVICE_OC - L=5 */
	0x1C, 0x03, 0x00, 0x08, 0xFF,

	/* CISTPL_VERS_1 - L=48+2+17+1 */
	0x15,  /*  CISTPL_VERS_1           Level 1 version/product */
	0x42,  /*  Tuple link          Link to next tuple */
	0x05,  /*  TPLLV1_MAJOR           Major revision number */
	0x00,  /*  TPLLV1_MINOR           Minor revision number */
	'S','m','a','r','D','T','V', /* 7 characters */
	0x00,
	'D','V','B',' ','C','A',' ','M','o','d','u','l','e',  /* 13 characters */
	0x00,
	'$','c','o','m','p','a','t','i','b','l','e','[','c','i','p','l','u','s','=','1',
	' ','c','i','p','r','o','f','=','0','x','0','0','0','0','0','0','0','1',']','$',
	0x00,
	0xFF,  /* End of tuple */

	/* CISTPL_MANFID - L=6 */
	0x20, 0x04, 0xFF, 0xFF, 0x01, 0x00,

	/* CISTPL_CONFIG - L=23 */
	0x1A, 0x15, 0x01, 0x0F, 0xFE, 0x01, 0x01, 0xC0, 0x0E, 0x41, 0x02,
	'D','V','B','_','C','I','_','V','1','.','0','0', /* 12 Characters */

	/* CISTPL_CFTABLE_ENTRY (Address 0x320): Length:19 */
	0x1B, 0x11, 0xC9, 0x41, 0x19, 0x37, 0x55, 0x4E, 0x5E, 0x1D, 0x56,
	0xAA, 0x60, 0x90, 0x01, 0x03, 0x50, 0xFF, 0xFF,

	/* CISTPL_CFTABLE_ENTRY ( Address 0x000 for DVB) - L=40 */
	0x1B, 0x26, 0xCF, 0x04, 0x19, 0x37, 0x55, 0x4D, 0x5D, 0x1D, 0x56,
	0x22, 0x20, 0xC0, 0x09, 'D','V','B','_','H','O','S','T', 0x00,
	0xC1, 0x0E, 'D','V','B','_','C','I','_','M','O','D','U','L','E',
	0x00,

	/* CISTPL_NO_LINK - L=2 */
	0x14, 0x00,

	/* CISTPL_END L=1 */
	0xFF
};

int main(void)
{
   uint32 eError;
   cit_op_OperatorStatusBody stStatusBody_now;
   cit_op_OperatorStatusBody stStatusBody_after;
   uint8 u8NitVersion;
   cit_op_NitBuffer stNitBuffer;
   cit_op_OperatorInfo stOpInfo;
   uint8 op_tune_0000_X[2] = {0xF0, 0x00};


   printf("[BOLD]OP op-prof_instl-type1_400_C Start \n");

   /* status_body_0101_C */
   stStatusBody_now.u8InfoVersion = 0x0;
   stStatusBody_now.u8NitVersion  = 0x0;
   stStatusBody_now.u8ProfileType = 0x1;
   stStatusBody_now.u8InitialisedFlag = 0x0;
   stStatusBody_now.u8EntChangeFlag  = 0x0;
   stStatusBody_now.u8EntValidFlag  = 0x1;
   stStatusBody_now.u8RefreshRequestFlag  = 0x0;
   stStatusBody_now.u8ErrorFlag  = 0x0;
   stStatusBody_now.u8DeliverySystemHint  = 0x1;
   stStatusBody_now.u16RefreshRequestDate = 0x0000;
   stStatusBody_now.u8RefreshRequestTime = 0x00;      
   /* set status_buffer_now */
   cit_op_SetOperatorStatusNow(&stStatusBody_now);
   

   /* status_body_0102_C */
   stStatusBody_after.u8InfoVersion = 0x0;
   stStatusBody_after.u8NitVersion = 0x0;
   stStatusBody_after.u8ProfileType = 0x1;
   stStatusBody_after.u8InitialisedFlag = 0x1;
   stStatusBody_after.u8EntChangeFlag  = 0x0;
   stStatusBody_after.u8EntValidFlag  = 0x1;
   stStatusBody_after.u8RefreshRequestFlag  = 0x0;
   stStatusBody_after.u8ErrorFlag  = 0x1;
   stStatusBody_after.u8DeliverySystemHint  = 0x1;
   stStatusBody_after.u16RefreshRequestDate = 0x0000;
   stStatusBody_after.u8RefreshRequestTime = 0x00;      
   /* set status_buffer_after_search */
   cit_op_SetOperatorStatusAfterSearch(&stStatusBody_after);


   /* op_nit_0000_C */
   u8NitVersion = 0x0;
   memcpy(stNitBuffer.au8NitBuffer, op_nit_0000_C, sizeof(op_nit_0000_C));
   stNitBuffer.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer.au8NitLabel, "op_nit_0000_C", 16); /* set nit_label */
   stNitBuffer.au8NitLabel[16] = '\0';
   stNitBuffer.u16NitSize = sizeof(op_nit_0000_C);   
   /* set nit_buffer_now */
   cit_op_SetNitBufferNow(&stNitBuffer);

   /* set nit_buffer_after_search */
   cit_op_SetNitBufferAfterSearch(&stNitBuffer);


   /* op_info_0101 */  
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
   stOpInfo.u8ProfileNameLen = 0x0E;
   strcpy(stOpInfo.au8ProfileName, "0_DTVL_Profile");
   /* set operator_info */ 
   cit_op_SetOperatorInfo(&stOpInfo);
   
   /* set CAM_ID in op_info - 34303043 */
   cit_op_SetCicamId(0x34303043);


   /* set empty delivery system descriptor loop - op_tune_0000_X  */
   cit_op_SetDeliveryDscrLoop(op_tune_0000_X);

   cit_op_EnableDisableOpResource(1);

   /* set CIS string */
   eError = cit_sys_SetAppCIS(CisData, sizeof(CisData)); 
   if(0 != eError)
   {
      printf("[BOLD]Set App CIS eError: %d \n", eError); 
   }   
   
   printf("[BOLD]OP script done\n"); 
   return 0;
}

main(); 


 
