/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1004_T[15] = {
0xF0,0x0D,
0x5A,0x0B,0x00,0x00,0x00,0x00,0x1F,0x84,0x82,0xFF,0xFF,0xFF,0xFF /* Invalid Frequecy 0x00000000 DVB-T */
};

int main(void)
{   
   uint32 eError;
   printf("[BOLD]OP op-prof_op-tune_804_signal_T Start \n");

   /* set delivery system descriptor loop - op_tune_1004_T */

   cit_op_SetDeliveryDscrLoop(op_tune_1004_T);

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


