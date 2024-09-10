# to do list : 
a one a check a two
###### notice that if more changes or steps needed should be wrttin here :: 
(if task is done delete task line/s)

Serving:
Git (front + back in 1 git) with human-able Readme.md with clear instructions

live website 
Please include :admin credentials in the README.md 


1. go on the notes that eyal dictate for us for the project and for the general instructions for the project {there is no check box because these are instructions and not an actual step in the process}
link for the instructions: 
https://johnbryce.echo.timetoknow.com/index.html#/$/library/%/notifications/isInboxExpanded/true/selectedFolder/inbox/selectedId/bb108327-b16f-49f9-b306-6f1661278239/$/echoPlayer/params/channelId=b287fb37-468c-4f55-9734-d2f73f7ebbbe&clk=vKuInfU1/page/11e5cd79-a99c-40ef-9c71-4e96850f0de9
 
2. implement the profile include frontend ( X ) :

3. implement the chat as basic as it can be ( x ) : 

4. decide if game gonna be just one main and only hero or keep as ai chat bot for dnd ( x ) :
    more simple chatbot , only three game style - maybe i'll add more in the future .( X + ?)

5. focus and specify the chat and web site ( Adding AI-extra 10 points !()! ) : 
    - ***try focus first on making a "pro" website .***
    - add toast messages for all the actions that the user can do - more like a real mmo game toast messages :
        1. login modal 
        2. register component 
        3. chat component 
        4. profile component 
        5. super - profile component 
        6. create character component *
    -adjust change create character , that instead of forms , use the library component to select the data and then use the data to create the character OR use character creation as a chat bot Ai that will assist the user to create the character .
    - send varifaction code to the email + check if the code is correct + change the password - after successfull implementing basic password change redirect to login page if not a real email two options : 1. send another file but to get auth need to input : username + email + last_name + birthdate. 2. email is invalid or not real -> redirect to login page with a toast message that email is invalid or not real -> try again with a real email.
    -make gemini integration using blueprints - as a simple chat , then add option in chat to add templates - like : the character creation template - that will create the character with the data that the user input in the chat - then the gemini will create the character in the game . instead of pulling the data from DB then send to chatbot , chatbot will create the character in the game - each user have a different character creation template and different chat data . (done)
    - maybe instead of using the MongoDB compass either find a way to connect to Atlas or use Atlas cluster directly OR use a different no sql DB like          firebase - work better with Gemini but will cost more to remember how to connect to it correctly and potentially more expensive .(done) - atlas is working fine.
    - incrypt pwd_user_str data that only when superuser is logged in and ask for a password to decrypt the pwd_user_str data and display for superuser both (backend & frontend)
    - add a DnD and game info library - contain all the data needed for the game mechanics , same component but in a table with select and search input box (races , spells , equipment , monsters , game styles and more if seems needed or found something more to add). - done - but need modification to make it more practical and cleaner design .

6. create unit tests for all API calls ( bonus 6 points - could help and wont hurt - ( ) - see if have time to implement) :
    - sending emails (3 extra points ).
    - Using unit test (extra 3 points each). 

7. design the website first edition ( X ) :


8. finish design part two/second edition or more , make it responsive as it can be and some git additions( ) : 
    - using ng-bootstrap+bootstrap to finish the responsiveness of the website : 
        1. make the toast messages more responsive , display the username when login(done) .
            also , customize toast messages of the other components
        2. angular : incrypt pwd_user_str data that only when superuser is logged in and ask for a password to decrypt the pwd_user_str data and display for superuser .
        4. add Scrollspy/Pagination in table of the website : profile tables (profile and character) , library (when created) and if there is more tables add to them too (done)
        5. add more design to login page - more like a real mmo game login page . (almost done)
        6. add more design to the chat page - more like a real mmo game chat page . 
        7.add more design to the homepage - more like a real mmo game homepage - add more relavent text.
        8. "" add more if have any"" 
    - Responsive (using MUI extra 2 points)
    

9.a. implemnt and finish the dockers ( ) :
    (Dockerfile ( bonus of 10 points! ))
    

these sections are recommanded for a project to be profitable and professinal implemantation : (fix vocabilary errors in this heading)

9.b. security measures ( ) :
    - add a security measure to the loggers so they dont show the full path to the file and just the name of the file .
    - add a sort of notification system, that monitor all loggers and use a real time db that send all logs data either to an portable hard drive or to the cloud (or to a sdd card - optional) .
    - improve logger more , and make them even more organised readable , send all Werkzeug in to different folder - for kind of Werkzeug messages , excluding the framework cmd temrinal logger Werzeug startup messages.
    - add more sections if u think its needed .
    - investigate DMZ SSL and SSH for higher securtiy for the local storage .



10. cloud deployment ( ) :
    for a deeper and more practical 
    - deploy on the cloud firebase ? 
    or if not using firebase/firestore and keep using Mongo for the chat DB : 
    - deploy with other cloud platform - do a little research 