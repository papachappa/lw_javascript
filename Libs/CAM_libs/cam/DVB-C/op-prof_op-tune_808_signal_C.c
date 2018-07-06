/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1008_C[41] = {
0xF0,0x27,
0x44,0x0B,0x04,0x74,0x00,0x00,0xFF,0xF2,0x05,0x00,0x68,0x75,0x0F, /* Func_main DVB-C */
0x44,0x0B,0xFF,0xFF,0xFF,0xFF,0xFF,0xF2,0x05,0x00,0x68,0x75,0x0F, /* Invalid Frequecy 0xFFFFFFFF DVB-C */
0x44,0x0B,0x05,0x06,0x00,0x00,0xFF,0xF2,0x05,0x00,0x68,0x75,0x0F /* DOTA DVB-C */
};

int main(void)
{   
   uint32 eError;
   printf("[BOLD]OP op-prof_op-tune_808_signal_C Start \n");

   /* set delivery system descriptor loop - op_tune_1008_C */

   cit_op_SetDeliveryDscrLoop(op_tune_1008_C);

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


