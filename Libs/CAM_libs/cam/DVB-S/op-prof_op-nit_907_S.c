/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


/* op_nit_2000_S */
uint8 op_nit_2000_S[45] = {
0x40,0xF0,0x2E,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0x1B,0x00,0x01,
0x00,0x85,0xF0,0x15,0x41,0x06,0x00,0x01,0x01,0x00,0x02,0x01,0x43,0x0B,0x01,0x18,0x04,0x00,0x01,0x92,
0x80,0x01,0x60,0x00,0x03
};
/* op_nit_9007_S */
uint8 op_nit_9007_S[179] = {
0x40,0xF0,0xB4,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0xA1,0x00,0x01,
0x00,0x85,0xF0,0x9B,0x43,0x0B,0x01,0x18,0x04,0x00,0x01,0x92,0x80,0x01,0x60,0x00,0x03,0x5F,0x04,0x00,
0x00,0x00,0x40,0xCC,0x1F,0x00,0x01,0x01,0xC0,0x65,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,
0x69,0x6C,0x65,0x5F,0x30,0x0A,0x43,0x41,0x4D,0x5F,0x30,0x31,0x5F,0x46,0x54,0x41,0xCC,0x21,0x00,0x02,
0x01,0xC0,0x66,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,0x69,0x6C,0x65,0x5F,0x30,0x0C,0x43,
0x41,0x4D,0x5F,0x30,0x32,0x5F,0x53,0x63,0x72,0x61,0x6D,0xCC,0x1F,0x00,0x01,0x01,0xC0,0x6F,0x0E,0x44,
0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,0x69,0x6C,0x65,0x5F,0x30,0x0A,0x43,0x41,0x4D,0x5F,0x31,0x31,
0x5F,0x46,0x54,0x41,0xCC,0x21,0x00,0x02,0x01,0xC0,0x70,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,
0x66,0x69,0x6C,0x65,0x5F,0x30,0x0C,0x43,0x41,0x4D,0x5F,0x31,0x32,0x5F,0x53,0x63,0x72,0x61,0x6D
};



int main(void)
{
   uint32 eError;
   uint8 u8NitVersion;
   cit_op_NitBuffer stNitBuffer;

   printf("[BOLD]OP op-prof_op-nit_907_S Start \n");   
   
   /* op_nit_2000_S */
   u8NitVersion = cit_op_GetNitVersion();
   memcpy(stNitBuffer.au8NitBuffer, op_nit_2000_S, sizeof(op_nit_2000_S));
   stNitBuffer.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer.au8NitLabel, "op_nit_2000_S", 16); /* set nit_label */
   stNitBuffer.au8NitLabel[16] = '\0';
   stNitBuffer.u16NitSize = sizeof(op_nit_2000_S);   
   /* set nit_buffer_now */
   cit_op_SetNitBufferNow(&stNitBuffer);
   
   /* op_nit_9007_S */
   u8NitVersion = (((cit_op_GetNitVersion() + 1) % 32) == 0) ? 1 : (cit_op_GetNitVersion() + 1); 
   memcpy(stNitBuffer.au8NitBuffer, op_nit_9007_S, sizeof(op_nit_9007_S));
   stNitBuffer.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer.au8NitLabel, "op_nit_9007_S", 16); /* set nit_label */
   stNitBuffer.au8NitLabel[16] = '\0';
   stNitBuffer.u16NitSize = sizeof(op_nit_9007_S);  
   /* set status_buffer_after_search */
   cit_op_SetNitBufferAfterSearch(&stNitBuffer);
   
   printf("[BOLD]OP script done\n"); 
   return 0;
}

main(); 


 
