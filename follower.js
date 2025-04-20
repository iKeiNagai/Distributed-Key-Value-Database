// follower.js
const zmq = require('zeromq');
const { Level }= require('level');
const db = new Level('./follower-db');

//zeromq suscriber
const subSocket = new zmq.Subscriber();

//connect to leader and suscribe to messages tagged with replicate
subSocket.connect('tcp://172.174.208.25:5555');
subSocket.subscribe('replicate');

(async () => {
    await db.open();

    //listens for published messages from leader
    for await (const [topic, message] of subSocket) {
        const { key, value } = JSON.parse(message.toString());
        await db.put(key, value);
        console.log(`Replicated: ${key} = ${value}`);
    }
})();
