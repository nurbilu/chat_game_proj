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
    - make change password in a different component + add link in login for change password component for "forgot your password? click here" - after successfull password change redirect to login page.
    - send varifaction code to the email + check if the code is correct + change the password - after successfull implementing basic password change redirect to login page
    - fix full gemini integration ai with the neccesary data to create game mechanics (races , spells , equipment , monsters , game styles maybe fireball too)
        chatbot_model.py was successfully split to blueprints , and chatbot as in the same chat error but integrated well to the gen_txt
        i think its better becuase it didnt worked as i wanted it to or well, maybe i should try again with a different approach .
    - maybe instead of using the MongoDB compass either find a way to connect to Atlas or use Atlas cluster directly OR use a different no sql DB like          firebase - work better with Gemini but will cost more to remember how to connect to it correctly and potentially more expensive .()
    - 2024-07-26 08:36:52,170 - WARNING - Unauthorized: /api/profile/update/
       2024-07-26 08:36:52,171 - WARNING - "PUT /api/profile/update/ HTTP/1.1" 401 58
       
       in Thunder Client :
       024-07-26 08:39:34,731 - DEBUG - (0.031) UPDATE `base_user` SET `last_login` = NULL, `is_superuser` = 0, `username` = 'fofo', `first_name` = 'fofo\'el', `last_name` =          'fofonski', `is_staff` = 0, `is_active` = 1, `date_joined` = '2024-07-26 04:01:12.271509', `password` = 'pbkdf2_sha256$390000$eaDekTr2pVLMqLxz0NXc5u$hy4JxKD1Xsa6GaH/6/l/           yIWADkR3O/Un4d7SBCNVfRo=', `email` = 'fofofofo1234@gmail.com', `address` = '', `birthdate` = '1962-12-04', `profile_picture` = 'profile_pictures/dog_user_8S2JZdX.png',            `pwd_user_str` = 'ffff1234' WHERE `base_user`.`id` = 32; args=(False, 'fofo', "fofo'el", 'fofonski', False, True, '2024-07-26 04:01:12.271509',            'pbkdf2_sha256$390000$eaDekTr2pVLMqLxz0NXc5u$hy4JxKD1Xsa6GaH/6/l/yIWADkR3O/Un4d7SBCNVfRo=', 'fofofofo1234@gmail.com', '', '1962-12-04', 'profile_pictures/dog_user_8S2JZdX.        png', 'ffff1234', 32); alias=default
       2024-07-26 08:39:34,741 - INFO - "PUT /api/profile/update/ HTTP/1.1" 200 201
       
       it seems there is a problem with the connection between the django and the angular

6. create unit tests for all API calls ( bonus 6 points - could help and wont hurt - ( ) - see if have time to implement) :
    - sending emails (3 extra points each).
    - Using unit test (extra 3 points). 

7. design the website first edition ( X ) :


8. finish design part two/second edition or more , make it responsive as it can be ( ) : 
    - using ng-bootstrap+bootstrap to finish the responsiveness of the website : 
        1. make the toast messages more responsive , display the username when login .
            also , customize taost messages of the other components
        2. ""add more sections if needed"" 
    - Responsive (using MUI extra 2 points)


9.a. implemnt and finish the dockers ( ) :
    (Dockerfile ( bonus + 10 points! ))
    - fix before build : 
        - ▲ [WARNING] Polyfill for "@angular/localize/init" was added automatically. [plugin angular-polyfills]
            In the future, this functionality will be removed. Please add this polyfill in the "polyfills" section of your "angular.json" instead. - fix this so it wont be a problem for the docker to build in the future or create a malfuction container .

9.b. security measures ( ) :
    - add a security measure to the loggers so they dont show the full path to the file and just the name of the file .
    - add a sort of notification system to that monitor al loggers and use a real time db that send all logs data either to an portable hard drive or to the cloud or to a sdd card .
    - improve logger more , and make them even more organised readable , send all Werkzeug in to different folder - for kind of Werkzeug messages , excluding the framework cmd temrinal logger Werzeug startup messages.
    - add more sections if u think its needed .
    



10. cloud deployment ( ) :
    not a must project wise , but will make the game more wide spread a fast reactions and prompts 
    - deploy on the cloud firebase ? 