### what to fix and errors : 
   ** ask some friends if they know any good on the docker - better then you (docker((((()))))) ** 

estimated total time frame: ~ 56 - 80+ hours

1.1.
 4848896:error:10000438:SSL routines:OPENSSL_internal:TLSV1_ALERT_INTERNAL_ERROR:..\..\third_party\boringssl\src\ssl\tls_record.cc:592:SSL alert number 80 - fix error first - dont let to run the code properly - fix error first , have also an error for the character create - fix error first for DB first - probably wiil fix the character create problem too (done - fixed - check again - suppose to be ok - happens every some updates)

(estimated time frame: 9-12 hours)(***done***)
   1.Z. adjust the display design of the library for cards , scrollspy and etc (almost done) - fix the expand/collapse seperate to each card (done)
   1.a. understand and create an expalnation for the offcanvas toggle icon (done)
   1.b. finish card tables design (almost done) - remove the seethrough effect from the cards flip (done)
   1.c. finish total lib design (almost done) - complete implementation of to left button(done) 
   1.d. complete the displayment of Load-srch-icon with loading component or not (done)


(estimated time frame: ~ 8 hours)( 3/4 done )
   2.a. change /adjust /fix /add toasts messages in all components (almost done) - make sure all toast have message content and finishings also lower the toast display position  (half done) - save draft toast message is display error after initiate login/logout - adjust code so dont upload character data back to DB - it usless - also check if there is more toast messages on the same component logic/ purpose that appears () - add more toast messages to the toast service () - fix toast and add new toast messages that does not exist for example : 
   when logout after life-tokens (access && / || refresh) is expaired like initiated logout ("goodbye {{username}} hope to see you soon" - or similar to that string in the same effect), change new pwd at chagne-pwd / reset-pwd , delete user + add character (fix abd adjust) , 
   2.b. add popover/tooltip to all buttons required for the user to know what will be the action of the button (?check if needed more (done?))
   2.c. change mouse cursor to pointer when hovering over offcanvas menu (done)
   2.d. finish library hover-card-move logic - when right scroll only display - Back to Left Side <button> , when bottom scroll only display - Back to Top <button> , else display both as current display state (done) - only fix/adjust the close <button> of the hover card of lib-search , chat , edit-profile , character-creation (done) - done but to chrcter-creation component (done)

(estimated time frame: ~ 9 hours)(almost done)
   3.a. fix / insure refresh token is working as expected with the login Modal as login component (?) - fix the remember me that is cleared from local storage 
   when logout (done?)
   3.b. add dislplay hover card of user characters prompt/s in create character component under the div of Character Creation Prompt Editor (done)(need to adjust character creation to to create more characters and display them here(optional)(done))

(estimated time frame: ~ 2 - 7 hours)( almost done - check for last updates - else - mark (___ done ___) )
3.5.a. add 2-3 functions to super profile page [block user access and unblock user access -fix and enable - 90% - 95% done - complete the is_blocked Route access , display user characters prompts - done ] (done)
sub-task : remove Super Profile or Profile and keep the other one {} (done)
3.5.b. add 2-3 functions to user chat page - continue to implement the text editor toolbar functions and input display(done)


(estimated time frame: ~ 3 - 12 hours)(4/5 done)
   4.a.fix login redirect from unauth page to login page (done?) 
   4.b. :
   - google , facebook and twitter login is removed from the login component (done)
   - google and social networks login is removed , fix forgot-pwd and reset-pwd to be sent to the email instead of redirect to login page or fill a 4 input form fields 
     to navigate to reset-pwd page too (half done) - need to fully implement the email msg sent for reset-pwd for "real" email address () - either set back to easy and "stupid" email auth or fix the authentication for the google email problem () if not possible considering the time frame remain - adjust the forget password only to "stupid" email auth (done) - fix reset-pwd , fixed reset-pwd navigate to msg-reset-pwd page ( done - check later .)
   4.c. design change pwd or remove the component display or link component to profile and design it (done) 
   4.d. try to implement after success login navigate to the last click component link button on navbar offcanvas (optional( half done )) - save to session storage but need implement the navigation to the last link after login ( done? - check if works later . ( done))
   4.e. adjsut character creation - OPTION 1 : enable to create more characters and display them in the character creation component (chosen)OR OPTION 2 (not chosen) : create a new character prompt and delete the old one ( half done ) - only implement the delete prompt (done) - display is more complex then expected - fix complexity by reducing or either finding a solution to display - adjust profile and chat pages accordingly : either set from last git or try to fix then set from last git (fixed) - adjust chat and fix some display bugs for profile and character creation ( half done ) - complete the character prompt display in chat component and fix display bugs for character prompts sub table display of spells , equipment and class abilities + fix the select character prompt in chat component (half done) - chat Equipment dispaly is incomplete , spells is good , Class Abilities is 100 % empty display - npt good , on profile page only basic character info is displayed - adjust + fix + complete ()

(estimated time frame: + 10 hours at least)()
   4.b. fix docker hub GUI (docker is fixed by itself - could be that OS updates fixed GUI(done?))


(if needed : estimated time frame: ~ 3 - 6 hours - might be optional)()
   5. maybe need one terminal command to run all the flask apps for docker (? maybe its not needed? )
      make all impelment of server from one terminal command - currnet different frameworks in different terminals - not good - need to be one command to run all frameworks from one folder as blueprints and run all in one command ( maybe its not needed?) 

(estimated time frame: ~ 2 - 7 hours)(done -check before docker build)
   6.a. add more visual effects to the website (almost done):
      - design the grid of character create component better (done) 
      - add visual effects to super profile page (done)
      - add visual effects to user chat page (done)

7.a. fix angular errors {optional()}
7.b. make logger simillarty to all flask apps ()
7.c. add to django logger - clr after ctrl + c ()

8.a. check / implement questionable tasks ()
8.b. implement docker-compose.yml file to run all flask apps in one command / docker-compose up --build ()
8.c. clean all comments to a better git displayment ()
8.d. final QA ()

**++ lets try to deliver the project by the date 15/11/2024 , if not possible - deliver as soon as possible. ++**

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

35. 3.d. adjsut nav to profile button in chat to be positioned or hover over (done)

36. 1.a.1. change img favImg to be offcanvas menu instead of the current favImg (done)

37. 2.c. keep unity of desisgn for all navbar in app () - all navbar are the same but to the character create component (done)

38. 3.a. adjust dice roller desisgn (done)

39. 1.d. design hover card close button (done- dont care if it is not perfect)

40. 1.a. match the visual effect of rest of the website to as homepage , login and register (done)

41. 1.a. understand and create an expalnation for the offcanvas toggle icon (done) 

42.

43.

44.

45.

46.

47.

48.

49.

50.

