/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR 6.2.1.1: Unattended Recording,
 *              Valid Recording
 * Script name: license_6211_cdef.c
 * Preconditions:
 * - Check if a scheduled recording can be made on an encrypted service
 *   while the host is in standby. If not then the tests are not applicable.
 * Description:
 * - This script supports HTR 6.2.1.1. c, d, e and f.
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;
   uint32             eUriVersion;
   uint8              u8UriRL = 0;
   uint8              u8EventId = 0;
   uint8              *pu8LicenseLabel = "LicenseA1";
   cit_license_Object stLicenseEvt;

   printf("HTR 6.2.1.1.(c,d,e,f): Unattended Recording, Valid Recording \n");

   /* Determine default URI version */
   eError = cit_uri_GetDefaultUriVersion(&eUriVersion);
   if(eError != 0)
   {
      printf("Failed to determine default URI version URIv%d, eError: %d \n", eUriVersion, eError);
      return 0;
   }
   printf("Default URI version is URIv%d \n", eUriVersion);

   /* Initialise the test system's persistent settings */
   eError = cit_lic_InitialiseNvram();
   if(eError != 0)
   {
      printf("Failed to initialise persistent settings, eError: %d \n", eError);
      return 0;
   }
   printf("Persistent settings are initialised \n");
   
   /* Set the default URI to Default_URI_004 */
   eError = cit_uri_SetURIMessage(eUriVersion);
   u8UriRL = 0xFF;
   cit_uri_SetRL(&u8UriRL);
   if(eError != 0)
   {
      printf("Failed to initialise URI message, eError: %d \n", eError);
      return 0;
   }
   eError = cit_uri_SaveDefaultURI();
   if(eError != 0)
   {
      printf("Failed to save default URI message in NVRAM, eError: %d \n", eError);
      return 0;
   }
   printf("Default URI is saved to NVRAM \n");

   /* Configure the URI/License events */
   memset(&stLicenseEvt, 0x00, sizeof(cit_license_Object));
   stLicenseEvt.tdtTime.u8Hour   = 12;
   stLicenseEvt.tdtTime.u8Min    = 12;
   stLicenseEvt.tdtTime.u8Sec    = 0;
   stLicenseEvt.u16ProgramNumber = 0x0002;
   stLicenseEvt.u8LicenseStatus  = 0x00;
   cit_uri_SetURIMessage(eUriVersion);
   if(eUriVersion > 1)
      cit_uri_SetDOT(0x01);
   cit_uri_Read(stLicenseEvt.pu8URI);
   stLicenseEvt.u16LicenseSize     = 0x100;
   stLicenseEvt.u8LicensePlayCount = 0x14;
   memcpy(stLicenseEvt.pu8LicenseLabel, pu8LicenseLabel, 16);
   memcpy(stLicenseEvt.pu8PlaybackURI, stLicenseEvt.pu8URI, 8);
   stLicenseEvt.u8PlaybackDelay = 0;
   eError = cit_lic_WriteEventConfig(u8EventId, &stLicenseEvt);
   if(eError != 0)
   {
      printf("Failed to write URI-License event [%d], eError: %d \n", u8EventId, eError);
      return 0;
   }
   u8EventId++;

   eError = cit_lic_ConfigureScheduler();
   if(eError != 0)
   {
      printf("Failed to configure URI/License events, eError: %d \n", eError);
      return 0;
   }
   printf("Configured %d URI-License events \n", u8EventId);

   /* Enable logging and select CICAM ID 0*/
   eError = cit_lic_WriteModuleConfig(0x01, 0x00);
   if(eError != 0)
   {
      printf("Failed to enable logging, eError: %d \n", eError);
      return 0;
   }
   printf("Logs are enabled \n");
   
   /* Print configuration */
   cit_lic_PrintConfiguration();

    
   return 0;
}

main();
