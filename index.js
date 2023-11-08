const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
const application = express();
application.use(cors());
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.get("/", (req, res) => {
    res.send("Running task-manager application Server");
});

application.listen(port, () => {
    console.log(`Task-manager Server listening at http://localhost:${port}`);
});



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@taskmanagercluster.qrnlr3e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB Atlas Database!");

        const database = client.db("TaskManagerDB");
        const taskCollection = database.collection("taskList");

        // GET ALL TASK (api)
        application.get("/get-task", async (req, res) => {
            const allTask = taskCollection.find({});
            const task = await allTask.toArray();
            res.send(task);
        });

        // POST/ADD A NEW TASK (api)
        application.post("/add-task", async (req, res) => {
            const reqBody = req.body;
            // console.log("hitted the post task API", insertItem);
            const result = await taskCollection.insertOne({ ...reqBody, status: "incomplete" });
            // console.log(result);
            res.json(result);
        });

        // GET A SPECIFIC TASK (api)
        application.get("/get-singletask/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const task = await taskCollection.findOne(filter);
            res.send(task);
        });

        // UPDATE a SINGLE TASK
        application.put("/update-task/:id", async (req, res) => {
            const id = req.params.id;
            const reqBody = req.body;
            console.log("hitted update task api with specific id", reqBody);
            // Create a filter for task with the _id
            const filter = { _id: new ObjectId(id) };

            // To set the upsert option true insert a document if no documents match the filter, otherwise update the existing value
            const options = { upsert: false };

            const updateDoc = {
                $set: {
                    taskName: reqBody.taskName,
                    description: reqBody.description,
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            console.log("updating task with specific id", result);
            res.json(result);
        });

        application.put("/update-task-status/:id", async (req, res) => {
            const id = req.params.id;
            const reqBody = req.body;
            console.log("hitted update-task-status api with specific id", reqBody.status);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: reqBody.status,
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc);
            console.log("update-task-status with specific id", result);
            res.json(result);
        });

        // DELETE A TASK
        application.delete("/delete-task/:id", async (req, res) => {
            const id = req.params.id;
            console.log("hitted delete task api with specific id", id);
            const filter = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(filter);
            console.log("deleted task with an id", result);
            res.json(result);
        });

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
