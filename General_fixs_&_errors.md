### what to fix and errors : 
   1.complete edit profile form - first name , last name enable to PUT()

   2.fix spell select copy in character create (done)

   3.clean data in DB collections - remove all url strings from the data , to make it more human understandable and not full of links ()

   4.a. - fix table displayment in character create ()
   4.b.  maybe need one terminal command to run all the flask apps for docker ()

   5.
   
   6. implement chracter create completely + fix Gemini integration : ()
         - change the intagration so API does not use the DB collection ()
         - add more templates for chat to make game gen quicker ()

###keep one before last : 

   7.a. make django framework more efficient - too many debug messages and many calls to each endpoints (?)()
   7. b. change toast messages if error so toast contect "wrong action" or "wrong data" or "wrong username or password" or "wrong email or password" or "wrong username or email" or "wrong username or email or password" or "wrong username or email or password or address" or "wrong username or email or password or address or birthdate" or "wrong username or email or password or address or birthdate or first name or last name" or "wrong username or email or password or address or birthdate or first name or last name or profile picture" , if success toast message "action done successfully" or "data saved successfully" or "username or password correct" or "email or password correct" or "username or email correct" or "username or email or password correct" or "username or email or password or address correct" or "username or email or password or address or birthdate correct" or "username or email or password or address or birthdate or first name or last name correct" or "username or email or password or address or birthdate or first name or last name or profile picture correct" ()

### best for last - check if still relevant/exists : 
1. async problem - Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received - seems to show in all components few moments after reload(only if presists in the future ( )) 

2.  ▲ [WARNING] Polyfill for "@angular/localize/init" was added automatically. [plugin angular-polyfills]
            In the future, this functionality will be removed. Please add this polyfill in the "polyfills" section of your "angular.json" instead. - fix this so it wont be a problem for the docker to build in the future or create a malfuction container .


3. [DOM] Found 2 elements with non-unique id #password: (More info: https://goo.gl/9p2vKq) 
   super-profile:1 [DOM] Found 2 elements with non-unique id #username: (More info: https://goo.gl/9p2vKq)  - check if this warning presists in the future and fix.

check again but not that important: 
1. 9. 6. add/fix/adjust/modify when reload from browser display the current component instead to homepage(done?)
2. 

DONE LIST : 

1. 1. fix redirection after login - now after login -> /chat , now is login -> /chat ->/homepage -> /chat - fix so only /chat is redirected after login. or is it reloading twice ? (done ?) - double check if it is reloading twice , let it rest and check if i fix if so (done) - done a better way - login in modal stay on the current page if not need auth , if need auth - redirect to /login then redirect to /chat - (done)

2. 2. navbar stick with top of the page when scrolling and centered with the page also offcanvas (done) 

3. 3. adjust homepage so all links need authentication that been not will redirect to login page (done)

4. 5. set reload after login either on the backend or on the frontend and either superuser or not superuser (done)

5. 2. make create character either a chat bot for the user to make a prompt for chat to create a charater ( not have to be AI but must use library/DB data and auto completion) OR either a form base on the library/DB data (as a option B). (half done).

6. 2. fix icon displayment for the text editor ( done )

7. 2. create a search component that will be used to search for the library - to fix search bar in the library - (done)

8. 4. implement chracter create completely + fix Gemini integration : ()
   - implenent character create prompt - done
   - fix Gemini integration - done .

9. 6. add/fix/adjust/modify when reload from browser display the current component instead to homepage(done?)

10. 2. add a check for refresh token - if not refresh token - login regular and logout also when access token expired - if refresh token - login with refresh token (done)

11. 1. fix that register without profile picture will use no_profile_pic.png as a profile picture (removed)

12. 1. a. adjust gen logger as other flasks (done)

13. 1.fix with all bugs form new DB collections.(done)

14. 4.a. fix lib = make sure data is written the right format - each time i shut my laptop - table are not displayed properly + flask framework error 500 !(done) - done way before last serctions dont know which one before.

15. 4. resolve the progress bar problem in character create (resolved)

16. 1.display user character prompts in user profile (done)

17.2.if not refresh token - login regular and logout also when access token expired - check if expire (ck) - add toast message for token expiration does not work as expected , refresh token lifetime is 14 days but instead in the angular it expires in 6 minutes( :-/ ) , need to fix that - now refresh token is not working at all - login fails(done) - getting closer - login works but life is not -is according to access token.(done) - might be fixed now - need to check later again (done i hope)

18.2.fix/continue implementing pwd toggle(done)

19. 2.openai assistent - fix or delete. (X) - been deleted.

20. 3.fix cards padding and - fix collapse for tables ,but not for the cards. (done)