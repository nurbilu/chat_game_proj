### what to fix and errors : 
   ** ask some friends if they know any good on the docker - better then you (docker((((()))))) ** 


   1.a. match the visual effect of rest of the website to as homepage , login and register (done?)
   1.b. finish card tables design (almost done)
   1.c. finish total lib design (almost done)
   1.d. design hover card close button ()

   2.a. change /adjust /fix /add toasts messages in all components (almost done)
   2.b. add popover/tooltip to all buttons required for the user to know what will be the action of the button (?check if needed more (almost done))
   2.c. keep unity of desisgn for all navbar in app () - all navbar are the same but to the character create component ()

   3.a. adjust dice roller desisgn (almost done)
   3.b. fix / insure refresh token is working as expected with the login Modal as login component ()
   3.d. adjsut nav to profile button in chat to be positioned or hover over ()


   4.fix login component to create a div for the login form to look as all other components using the same format (done?)
   if not implement login by google and facebook and twitter , remove ()
   - add google login (optional)
   - add facebook login (optional)
   - add twitter login (optional)

   4.b. fix docker hub GUI ()

   5. maybe need one terminal command to run all the flask apps for docker (? maybe its not needed? )
      make all impelment of server from one terminal command - currnet different frameworks in different terminals - not good - need to be one command to run all frameworks from one folder as blueprints and run all in one command ( maybe its not needed?) 

   6.a. add more visual effects to the website ()


questionable tasks: 
   6.b. clean data in DB collections - remove all url strings from the data , to make it more human understandable and not full of links (maybe undoable in short term - necessary ?)
###keep one before last : 

   7.a. make django framework more efficient - too many debug messages and many calls to each endpoints (?)()
   <!-- 7. b. change toast messages if error so toast contect "wrong action" or "wrong data" or "wrong username or password" or "wrong email or password" or "wrong username or email" or "wrong username or email or password" or "wrong username or email or password or address" or "wrong username or email or password or address or birthdate" or "wrong username or email or password or address or birthdate or first name or last name" or "wrong username or email or password or address or birthdate or first name or last name or profile picture" , if success toast message "action done successfully" or "data saved successfully" or "username or password correct" or "email or password correct" or "username or email correct" or "username or email or password correct" or "username or email or password or address correct" or "username or email or password or address or birthdate correct" or "username or email or password or address or birthdate or first name or last name correct" or "username or email or password or address or birthdate or first name or last name or profile picture correct" () -->

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

21. 2.fix spell select copy in character create (done)

22. 1.complete edit profile form - first name , last name enable to PUT(done)

23. 3. fix table displayment in character create (done)

24. 1.a. better design home page (done)

25. 1.b. add cursor marking for accordions of character create (done)

26.   3. adjust chat grid displayment , and add a DnD Dices div to the chat grid (done)
   - find a good DnD dice app to integrate to the chat grid / template (done)
   - design the DnD dice app to be integrated to the chat grid if a template - check if design is good and functional (done)

27.   1.a. finish lib table design (done)

28 .4.make sure remember me checkbox is working also in the login component not just on the modal - fix refresh token login in login component as login modal (done) 

29 .3.b. adjust the login modal design (done)

30 .2.d. add placeholder to all input fields in register / add popover to all input fields in register (done)

31. 2.c. fix popover titles color to be black (done) : about - done , create character - done , lib-search - done , edit profile - done 

32. 1.d. fix register picture upload (done)

33. 2.5. fix lib - search displayment design subcards dispalayment (done)

34. 1.d. fix so search result sub card hover will be displayed as static hover not active hover (done)

35. 

36.

37.

38.

39.

40. 

