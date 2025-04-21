//Leader Node
const zmq = require('zeromq');
const express = require('express');
const { Level } = require('level');
const db = new Level('./db');

const app = express();

//middleware parse json requests
app.use(express.json());

//zeromq publisher socket
//broadcast updates
const pubSocket = new zmq.Publisher();
pubSocket.bind('tcp://*:5555'); // bind pub socket

// Store key-value
app.post('/set', async (req, res) => {
    const { key, value } = req.body;

    //store in leveldb
    await db.put(key, value);
    console.log(`Stored: ${key} = ${value}`);

    //replicate to followers
    await pubSocket.send(['replicate', JSON.stringify({ key, value })]);

    res.send('Stored and replicated');
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

app.get('/all', async (req, res) => {
    const allData = [];

    try {
        for await (const [key, value] of db.iterator()) {
            allData.push({ key, value });
        }
        res.json(allData);
    } catch (err) {
        console.error('Failed to read all data:', err);
        res.status(500).send('Error reading from database');
    }
});

app.listen(3000, () => console.log('Leader node running on port 3000'));
