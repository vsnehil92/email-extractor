TODO Ruben :
---------------<br/>
1. Get some Icons  in different sizes (128x128, 48x48, 16x16)
2. Think of email extension name
3. If you have specific name of the tams in the UI panel

Next Meeting is July 18th.  17:30 18:00 CEST 
TODO A, to be done   (Used for Email Extension)
---------------<br/>
1. The chrome extension UI  version1 
2. The fetching emails with regex on DOM
3. storing it to the local storage.


TODO B  (Used for Email Extension)
---------------<br/>
1. UI Version 2   with tabs like https://chrome.google.com/webstore/detail/email-extractor/fgcoaakamhopmbbbllmpocacgkhjhmbp    Refer to Panel UI Description
2. Historic Storage With multiple columns [ Email, Domain , Source ]  
3. Add Regex for visible text (like chrome CTRL+F)

TODO C  ( Used for both Extensions ) 
---------------<br/>
1. The user has a GUI  to enter with fields [Firstname] [LastName] [domain] . And another results section  which only shows results of these automated searches 
2. Automate Search Engine Search for Person’s name and company name.  (in a new window) 
    1. For example https://www.google.ch/search?num=30&q=Hans+Peter+Gr%C3%A4nicher+%22d1-solutions.com%22&oq=Hans+Peter+Gr%C3%A4nicher+%22d1-solutions.com%22
3. Then we visit all the links from the front page of the search engine  (each in a new tab)  and close them after you finished loading and found emails. 
4. Auto detect emails as normal from every page. And store them to long term storage.  BUT for the specific query make sure the emails actually contain the expected company domain and at least one  (Firstname or lastname).   These emails we find from automation that match the users search query can be stored again in a separate text box. 
5. Make a copy of the chrome extension autosearch tab.  But now allow also to search for a job description. And a location 
    1. Visit all the linkedin profiles 
    2. Detect if linkedin is blocking you and stop the search with an error to the user. Linkedin asks you to login if it detects that you are visiting too much. (not alert,  this should be part of UI.  BIG RED box pops up with error : please login to linkedin for better scraping results ).  If not logged in we can still get information but we need to delete the cookies after every load. 
    3. Extract all Person Profile information
        1. Name 
        2. Self Description
        3. Current Employment Company  : The one job which has “ - Present “   in the time description 
        4. List of jobs  { Company Name,  Company Linkedin Link, Job Location, Start date,  End date,  is Employed there Currently } 
    4. Visit Every Company profile which they have listed.  
        1. Name 
        2. Industry  ( Top box )
        3. URL   (remove http or https ://  ) 
        4. Size 
        5. Type of company   
        6. Age of company  (click “see more” ) 
        7. Recall which profiles you have visited in the past and do not visit them twice. 
        8. Store Raw Data (html + ajax payloads ). 

TODO D ( Used for both Extensions )  DB Storage 
---------------<br/>
Build a Flask based REST api to store all the information users find 

TODO E  ( Used for both Extensions ) User Accounts 
1. Allow people to login so they can save their personal searches to the “cloud” 
2. Allow people to earn “credits”  to search the DB by executing scheduled searches proposed by the server.   (you don’t have to store these credits they are on a different server just add a button that is “Earn Credits By letting your chrome search in the background” )

TODO X   (Used for Email Extension)
1. Adding an option for TAGS. So we give the user a field where they can add a tag to all the emails found currently.   For example they could be looking for emails of bloggers, so before they start their search they add the TAG=blogger  so that these emails can be easily filtered from the others later 
2. First name Last Name   if possible
3. Adjust for common patterns like adding “nospam” into the domain  or changing the @  for (at) 

TODO L (used for Linkedin Extension ) 

1. Add linkedin actions after the search and profile visit the user clicks “Add Connection”  
2. Give the user additional filter options to only add connections under some conditions like : the city the profile is in 
3. Check the user’s Connections page to identify new connections and then automatically send recently added connections a templated message 



We are making a copy of these typical Chrome Extension for Email Extraction 

https://chrome.google.com/webstore/detail/email-extractor/jdianbbpnakhcmfkcckaboohfgnngfcc?hl=en 
https://chrome.google.com/webstore/detail/email-extractor/fgcoaakamhopmbbbllmpocacgkhjhmbp  
https://chrome.google.com/webstore/detail/email-auto-extractor/blkpobilpealkkcibgcgfmflneafkkah?hl=en 
https://chrome.google.com/webstore/detail/email-hunter/igpjommeafjpifagkfhebdbofcokbhcb?hl=en 


Milestone 1. Technical Tasks 
Basic Chrome UI 
How to do HTML5 local storage < Chrome Storage 
How to do browser actions like visiting sites in a new page 
How to have a background page that is always storing emails 
How to do Search on the rendered page  like Ctrl+F  


Simple UI  with dialog window popup from the button 
---- Panel UI Description ----
Panel 1) Emails found on this current page 

Buttons, Copy, TXT, CSV  like above 

Emails are extracted with basic regex on DOM
Emails are extracted with Find on visible text of rendered page 

Make sure all the ajax calls are done 

Panel 2) All emails found in the past 
Here we have a table with columns [ email, email domain ,firstname(if availiable), lastname(if available), TAGS , url of website found ]  

Buttons :  Copy, CSV,  Filter ( some simple javascript table filter so you can get all emails from one domain for example,  we should be able to find a plugin ) 

Storage :  This should be stored locally with HTML5 storage but later saved on the server 

Panel 3) Auto visit / Search Page 




Option 1)  Simply copy past a list of URLS to visit 
Option 2)  Provide some search terms Like the name of a person you want to find and the company name. Then we have some simple predefined search queries we make like “Frist.Last@” “last@” “firstLast@” “lastfirst@”   “First Last email “ “email first last  company name”  “first last contact”  “about us first last”  etc (other searches)  we query all of them and look for emails
2a)  Follow every link the search engine returns and check the results full text 
2c)  Find the most probably homepage for this company. (look at search results which have domain names similar to the company name)  then do  “first laslt email site:companyname.com”


Panel 4) Settings 

Here there will be things like “Sign in with Google”  
Turn off automatic saving of emails on every website. (If off then it only stores emails when you click the extension button ) 



Milestone 2  :

Good list of emails hiding techniques https://superuser.com/questions/235937/does-e-mail-address-obfuscation-actually-work 



***when we start working on linkedin extension. Lets make sure to not get detected by linkedin https://www.nymeria.io/blog/linkedins-war-on-email-finder-extensions-like-nymeria 
** https://blog.hunter.io/we-are-shutting-down-our-linkedin-integration-d47b898a2623 
