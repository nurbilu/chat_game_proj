1. async problem - Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received - seems to show in all components few moments after reload(only if presists in the future ( )) 

2. fix isSuperUser not being detected on navbar at all , check what is the diffrerece between non superuser and superuser on the backend and frontend - check with ThunderClient (probably its the frontend - but worth checking to make sure - lion in the desert this).

3. adjust homepage so all links need authentication that been not will redirect to login page. (done)

4.  ▲ [WARNING] Polyfill for "@angular/localize/init" was added automatically. [plugin angular-polyfills]
            In the future, this functionality will be removed. Please add this polyfill in the "polyfills" section of your "angular.json" instead. - fix this so it wont be a problem for the docker to build in the future or create a malfuction container .


5. [DOM] Found 2 elements with non-unique id #password: (More info: https://goo.gl/9p2vKq) 


super-profile:1 [DOM] Found 2 elements with non-unique id #username: (More info: https://goo.gl/9p2vKq)  - check if this warning presists in the future and fix.