/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>

int main(void)
{
uint32 GetChar;
uint32 eError;

	GetChar = cit_sys_GetTableListStatus();
	
	cit_sys_ShowTableLists();
	if(0 != eError)
	{
   	  printf("Error displaying host supported character tables");
	}
	
	if (GetChar == 0)
	{
	printf("Warning: this test is not testable (Host did not respond with its supported character list)\n");
	}
	return 0;
}
main();