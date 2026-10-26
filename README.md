created the next app . 
tech using is :
next.js , shadcn UI(component library),redis(for making the bridge token),bullMQ(for the blowjob(async work ) )
neon for the database 
why did i choose the these technology app ?
because i dont want to make a seperate server for this application i want integrated node.js application prebuild to kick start the project which next js provide automatically .
shadcn UI (provide good component for dashboards and time saving )
redis (here can use redis for caching but i am using to make a ttl token that will expire in 15 min after the user login and it will auto expire after that .)
bullMQ is for (async job like getting the user ats or other thing form the resume and show in the dashboard)
thats it .
that is the reason of using these technology.

# next steps is 
1. do the authenication (using OAuth)
2. then make two authencation using OAuth (IYKYK).
3. after that make the whole form where user see the jobs , then get the signin ,then fill the form done.
4. make the dashboard .
5. add the middleware and make the route protected.

that all for now