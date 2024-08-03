1.fix redirection after login - now after login -> /chat , now is login -> /chat ->/homepage -> /chat - fix so only /chat is redirected after login.

2.navbar stick with top of the page when scrolling and centered with the page () 

3. adjust homepage so all links need authentication that been not will redirect to login page. (done)


4. fix that register without profile picture will use no_profile_pic.png as a profile picture ()

5. set reload after login either on the backend or on the frontend and either superuser or not superuser (done)

6. set library 

7. add/fix/adjust/modify when reload from browser display the current component instead to homepage()

best for last : 
1. async problem - Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received - seems to show in all components few moments after reload(only if presists in the future ( )) 

2.  ▲ [WARNING] Polyfill for "@angular/localize/init" was added automatically. [plugin angular-polyfills]
            In the future, this functionality will be removed. Please add this polyfill in the "polyfills" section of your "angular.json" instead. - fix this so it wont be a problem for the docker to build in the future or create a malfuction container .


3. [DOM] Found 2 elements with non-unique id #password: (More info: https://goo.gl/9p2vKq) 
   super-profile:1 [DOM] Found 2 elements with non-unique id #username: (More info: https://goo.gl/9p2vKq)  - check if this warning presists in the future and fix.