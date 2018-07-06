/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1008_S[41] = {
0xF0,0x27,
0x43,0x0B,0x01,0x14,0x50,0x00,0x01,0x92,0x81,0x02,0x20,0x00,0x05, /* Func_main DVB-S */
0x43,0x0B,0xFF,0xFF,0xFF,0xFF,0x01,0x92,0x81,0x02,0x20,0x00,0x05, /* Invalid Frequecy 0xFFFFFFFF DVB-S */
0x43,0x0B,0x01,0x21,0x09,0x00,0x01,0x92,0x81,0x02,0x20,0x00,0x05 /* DOTA DVB-S */
};

int main(void)
{   
   uint32 eError;
   printf("[BOLD]OP op-prof_op-tune_808_signal_S Start \n");

   /* set delivery system descriptor loop - op_tune_1008_S */

   cit_op_SetDeliveryDscrLoop(op_tune_1008_S);
 
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


