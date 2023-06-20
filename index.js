const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();




// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zq9ay5k.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const classesCollection = client.db("CCA").collection("classes");
        const usersCollection = client.db("CCA").collection("users");
        const cartCollection = client.db("CCA").collection("cart");


        // Classes related api's
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result)
        })

        app.post('/classes', async (req, res) => {
            const newClass = req.body;
            const result = await classesCollection.insertOne(newClass)
            res.send(result)
        })

        app.get('/instructor-classes', async (req, res) => {
            const email = req.query.email;


            const query = { instructorEmail: email };
            const result = await classesCollection.find(query).toArray();
            res.send(result);
        });


        app.get('/classslimit', async (req, res) => {
            const limit = parseInt(req.query.limit)
            const result = await classesCollection.find().limit(limit).toArray();
            res.send(result)
        })


        // Cart related apis
        app.get('/carts', async (req, res) => {
            const email = req.query.email;

            if (!email) {
                return res.send([]);
            }

            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });



        app.post('/carts', async (req, res) => {
            const item = req.body;
            const result = await cartCollection.insertOne(item);
            res.send(result);
        })

        app.delete('/carts/:id', async(req, res) =>{
            const id = req.params.id;
            const quarey = {_id: new ObjectId(id)}
            const result = await cartCollection.deleteOne(quarey)
            res.send(result)
        })


        // Users related apis
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const previousUser = await usersCollection.findOne(query);

            if (previousUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        // Admin routes 

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })


        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })


        app.patch('/classes/permission/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: 'Approve'
                },
            }
            const result = await classesCollection.updateOne(filter, updateDoc);
            res.send(result);
        })



        // Instructor routes
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { instructor: user?.role === 'instructor' }
            res.send(result);
        })


        app.get('/allinstructor', async (req, res) => {
            const query = { role: 'instructor' }
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })


        app.get('/instructorlimit', async (req, res) => {
            const limit = parseInt(req.query.limit)
            const query = { role: 'instructor' }
            const result = await usersCollection.find(query).limit(limit).toArray();
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('CCA server is running')
})

app.listen(port, () => {
    console.log(`CCA is running on ${port}`);
})

