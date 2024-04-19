const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wueeg5w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const projectCollection = client.db("salamDB").collection("projects")
        const userCollection = client.db("salamDB").collection("user")
        const resumeCollection = client.db("salamDB").collection("resume")
        const skillCollection = client.db("salamDB").collection("skill")


        app.post('/user', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
        })
        app.get('/user', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = userCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/projects', async (req, res) => {
            const result = await projectCollection.find().sort({ _id: -1 }).toArray()
            res.send(result)
        })
        app.post('/project', async (req, res) => {
            const project = req.body;
            const result = await projectCollection.insertOne(project)
            res.send(result)
        })
        app.delete('/project/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await projectCollection.deleteOne(query)
            res.send(result)
        })

        
        app.get('/skills', async (req, res) => {
            const result = await skillCollection.find().sort({ _id: -1 }).toArray()
            res.send(result)
        })
        app.post('/skill', async (req, res) => {
            const skill = req.body;
            const result = await skillCollection.insertOne(skill)
            res.send(result)
        })
        app.delete('/skill/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await skillCollection.deleteOne(query)
            res.send(result)
        })


        app.get('/resume', async (req, res) => {
            const result = await resumeCollection.find().toArray()
            res.send(result)
        })
        app.put('/resume/:id', async (req, res) => {
            const id = req.params.id;
            const updateResume = req.body;
            console.log(updateResume);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const update = {
                $set: {
                    name: updateResume.name,
                    link: updateResume.link
                }
            }
            const result = await resumeCollection.updateOne(filter, update, options)
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is runing from ${port}`)
})