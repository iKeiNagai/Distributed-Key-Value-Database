# Distributed Key/Value Database

## Setting up Virtual Machines
install nodejs in every node 
    ```https://deb.nodesource.com/```

install ZeroMQ

    ```sudo apt-get install -y libzmq3-dev```

install packages

    ```npm install express zeromq level``` 


## To Run

Leader: 

- In network settings, allow inbound traffic on port 3000 & 5555
- node leader.js

Followers:

- In network settings, allow outbound traffic on port 5555
- node follower.js

## To test using Postman

- Set request method to POST
- http://{leader-ip-address}:3000/set
- In headers tab, 
    key: Content-Type
    value: application/json
- In body tab,
    {
        "key" : "any",
        "value" : "any"
    }