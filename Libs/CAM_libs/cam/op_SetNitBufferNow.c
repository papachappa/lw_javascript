/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_nit_0002_T[48] = {
0x40, 0xF0, 0x31, 0x00, 0x86, 0xC1, 0x00, 0x00, 0xF0, 0x06, 0x40, 0x04, 0x44, 0x54, 0x56, 0x4C, 0xF0, 0x1E, 0x00, 0x01, 0x00, 0x85, 0xF0, 0x18,
0x41, 0x09, 0x00, 0x01, 0x01, 0x00, 0x02, 0x01, 0x00, 0x03, 0x01, 0x5A, 0x0B, 0x02, 0xD3, 0x44, 0x40, 0x1F, 0x84, 0x82, 0xFF, 0xFF, 0xFF, 0xFF
};

int main(void)
{
   uint32 eError;
   cit_op_NitBuffer stNitBuffer;
   uint8 *pu8NitLabel = "op_nit_0002_T";
   uint8 u8NitVersion;

   printf("[BOLD] Set Nit Buffer Now test script \n");

   u8NitVersion = cit_op_GetNitVersion();
  printf("sizeof(op_nit_0002_T) = %d\n", sizeof(op_nit_0002_T));
   memcpy(stNitBuffer.au8NitBuffer, op_nit_0002_T, sizeof(op_nit_0002_T));


   strncpy(stNitBuffer.au8NitLabel, pu8NitLabel, 16);
   stNitBuffer.au8NitLabel[16] = '\0';

   stNitBuffer.u16NitSize = sizeof(op_nit_0002_T);
   printf("stNitBuffer.u16NitSize = %d\n", stNitBuffer.u16NitSize);
   cit_op_SetNitBufferNow(&stNitBuffer);

   printf("[BOLD] Set Nit Buffer Now test script done\n");
   return 0;
}

main();


