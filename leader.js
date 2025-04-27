//Leader Node
const zmq = require('zeromq');
const express = require('express');
const crypto = require('crypto');
const { Level } = require('level');
const db = new Level('./db');

const app = express();

//middleware parse json requests
app.use(express.json());
app.use(express.static('public'));

//zeromq follower sockets
const followerAddresses = [
    'tcp://{ip-address}:5555',
    'tcp://{ip-address}:5555'
];

//create push sockets (push/pull pattern)
const pushSockets = [];
(async () => {
    for (const address of followerAddresses) {
        const sock = new zmq.Push();
        await sock.connect(address);
        pushSockets.push(sock); //add to arr
        console.log(`Connected to follower at ${address}`);
    }
})();

//computes which follower should own key (md5 hashing)
function getFollowerIndex(key) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return parseInt(hash.slice(0, 4), 16) % followerAddresses.length;
}

// Store key-value
app.post('/set', async (req, res) => {
    const { key, value } = req.body;

    //store in leveldb
    await db.put(key, value);
    console.log(`Stored: ${key} = ${value}`);

    //sets follower socket
    const index = getFollowerIndex(key);
    const followerSocket = pushSockets[index];

    //replicate to follower
    await followerSocket.send(JSON.stringify({ action: 'replicate', key, value }));

    res.send(`Stored and replicated in ${index}`);
});

//retrieve value by key
app.get('/get/:key', async (req, res) => {
    try {
        const value = await db.get(req.params.key);
        res.send({ key: req.params.key, value });
    } catch (err) {
        res.status(404).send('Key not found');
    }
});

//return all key-value pairs
app.get('/all', async (req, res) => {
    const allData = [];

    try {
        //iterates though db
        for await (const [key, value] of db.iterator()) {
            allData.push({ key, value });
        }
        res.json(allData);
    } catch (err) {
        console.error('Failed to read all data:', err);
        res.status(500).send('Error reading from database');
    }
});

//delete key in db
app.delete('/delete/:key', async (req, res) => {
    try {
        await db.del(req.params.key);
        console.log(`Deleted: ${req.params.key}`);

        //set follower
        const index = getFollowerIndex(key);
        const followerSocket = pushSockets[index];

        //notifies follower
        await followerSocket.send(JSON.stringify({action:'delete', key: req.params.key }));

        res.send(`Deleted from leader and follower ${index}`);
    } catch (err) {
        res.status(404).send('Key not found');
    }
});

app.listen(3000, () => console.log('Leader node running on port 3000'));
