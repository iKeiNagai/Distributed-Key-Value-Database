// follower.js
const zmq = require('zeromq');
const { Level }= require('level');
const db = new Level('./follower-db');

//pull socket & binds to port
const pullSocket = new zmq.Pull();
pullSocket.bind('tcp://*:5555');

(async () => {
    await db.open();

    //listens for published messages from leader
    for await (const message of pullSocket) {
        const { action, key, value } = JSON.parse(message.toString());

        if ( action === 'replicate') {

            await db.put(key, value);
            console.log(`Replicated: ${key} = ${value}`);

          } else if (action === 'delete') {

            await db.del(key);
            console.log(`Deleted: ${key}`);
            
          }
    }
})();
