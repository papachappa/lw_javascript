/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>

int main(void)
{
   uint32 eError;
   cit_op_OperatorStatusBody stStatusBody_now;
   cit_op_OperatorStatusBody stStatusBody_after;
   cit_op_NitBuffer stNitBuffer;
   cit_op_OperatorInfo stOpInfo;
   uint8 u8NitVersion;

   printf("[BOLD]OP op-prof_op-tune_801_refresh_C Start \n");


   /* status_body_0801_C */
   stStatusBody_now.u8InfoVersion = cit_op_GetInfoVersion();
   stStatusBody_now.u8NitVersion  = cit_op_GetNitVersion();
   stStatusBody_now.u8ProfileType = 0x1;
   stStatusBody_now.u8InitialisedFlag = 0x1;
   stStatusBody_now.u8EntChangeFlag  = 0x0;
   stStatusBody_now.u8EntValidFlag  = 0x1;
   stStatusBody_now.u8RefreshRequestFlag  = 0x2;
   stStatusBody_now.u8ErrorFlag  = 0x0;
   stStatusBody_now.u8DeliverySystemHint  = 0x1;
   stStatusBody_now.u16RefreshRequestDate = 0x0000;
   stStatusBody_now.u8RefreshRequestTime = 0x00;      
   /* set status_buffer_now */
   cit_op_SetOperatorStatusNow(&stStatusBody_now);
   

   /* status_body_0802_C */
   stStatusBody_after.u8InfoVersion = stStatusBody_now.u8InfoVersion + 0;
   stStatusBody_after.u8NitVersion = stStatusBody_now.u8NitVersion + 0;
   stStatusBody_after.u8ProfileType = 0x1;
   stStatusBody_after.u8InitialisedFlag = 0x1;
   stStatusBody_after.u8EntChangeFlag  = 0x0;
   stStatusBody_after.u8EntValidFlag  = 0x1;
   stStatusBody_after.u8RefreshRequestFlag  = 0x0;
   stStatusBody_after.u8ErrorFlag  = 0x0;
   stStatusBody_after.u8DeliverySystemHint  = 0x1;
   stStatusBody_after.u16RefreshRequestDate = 0x0000;
   stStatusBody_after.u8RefreshRequestTime = 0x00;      
   /* set status_buffer_after_search */
   cit_op_SetOperatorStatusAfterSearch(&stStatusBody_after);

   
   printf("[BOLD]OP script done\n");
   return 0;
}

main();


