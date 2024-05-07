const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 9000;

//middleWare
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credential: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrdje6l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
   

    const jobsCollection=client.db('soloSphere').collection('jobs')
    const bidsCollection=client.db('soloSphere').collection('bids')


    //Get all jobs data from database

    app.get('/jobs',async(req,res)=>{
        const result=await jobsCollection.find().toArray()
        res.send(result)
    })

    app.get('/job/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id : new ObjectId(id)}
      const result=await jobsCollection.findOne(query)
      res.send(result)
    })

    //save bid data id in DB
    app.post('/bid',async(req,res)=>{
      const bidData=req.body
      const result=await bidsCollection.insertOne(bidData)
      res.send(result)
    })
    //save job data id in DB
    app.post('/job',async(req,res)=>{
      const JobData=req.body
      const result=await jobsCollection.insertOne(JobData)
      res.send(result)
    })

    //get all jobs posted by a specific user
    app.get('/jobs/:email',async(req,res)=>{
      const email=req.params.email
      const query={'buyer.email' : email}
      const result=await jobsCollection.find(query).toArray()
      res.send(result)
    })





    // Send a ping to confirm a successful connection
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("soloSphere server is running");
});

app.listen(port, () => {
  console.log(`soloSphere is  listening on port ${port}`);
});
