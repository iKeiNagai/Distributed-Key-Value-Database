# Distributed Key/Value Database

This project implements a simple distributed key/value database.

It features leader-follower replication, basic sharding based on key hashing, and local persistence.

## Technologies Used

- Express&Node.js: Used as the main runtime environment for the Leader and Follower, and for handling HTTP requests.

- ZeroMQ: Provides fast, lightweight messaging between the Leader and Followers.

- LevelDB: Used for local persistent storage on both the Leader and Followers.

## Features

- Key-Value Storage: Add, retrieve, delete, and list key-value pairs via HTTP API.

- Replication: Each key is also stored in a follower for redundancy.

- Sharding: Keys are distributed among followers using a hash function.

- Persistence: Data is saved to local disk using LevelDB.

- ZeroMQ Messaging: Fast and efficient communication between leader and followers.

## Setting up Virtual Machines

Install nodejs in every node 

    ```https://deb.nodesource.com/```

Install ZeroMQ

    sudo apt-get install -y libzmq3-dev

Install packages

    npm install express zeromq level 

### For the  leader

- Allow inbound traffic on port 3000 for the HTTP API.
- Allow outbound traffic on port 5555 to push messages to followers.

### For the follower

- Allow inbound traffic on port 5555 so followers can listen for messages.

## To Run

Clone repo

    git clone https://github.com/iKeiNagai/Distributed-Key-Value-Database.git

Navigate into folder

    cd Distributed-Key-Value-Database

Leader: 

    node leader.js

Followers:

    node follower.js

Access UI to test

    http://<leader-ip-address>:3000

## To test using Postman

### SET
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

### GET

- Set request method to GET
- http://{leader-ip-address}:3000/get/key

### DELETE

- Set request method to DELETE
- http://{leader-ip-address}:3000/delete/key

### GET ALL 

- Set request method to GET
- http://{leader-ip-address}:3000/all