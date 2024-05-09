const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 9000;

//middleWare
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).send({ message: "unauthorized access" });
      }
      console.log(decoded);
      req.user = decoded;
      next();
    });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrdje6l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = client.db("soloSphere").collection("jobs");
    const bidsCollection = client.db("soloSphere").collection("bids");

    //jwt generate
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.get("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ success: true });
    });

    //Get all jobs data from database

    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    //save bid data id in DB
    app.post("/bid", async (req, res) => {
      const bidData = req.body;
      //check if its a duplicate request
      const query = {
        email: bidData.email,
        job_id: bidData.job_id,
      };
      const alreadyApplied = await bidsCollection.findOne(query);

      if (alreadyApplied) {
        return res
          .status(400)
          .send("You have already placed a bid on this job");
      }

      const result = await bidsCollection.insertOne(bidData);
      res.send(result);
    });
    //save job data id in DB
    app.post("/job", async (req, res) => {
      const JobData = req.body;
      const result = await jobsCollection.insertOne(JobData);
      res.send(result);
    });

    //get all jobs posted by a specific user
    app.get("/jobs/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const tokenEMail = req.user.email;
      if (tokenEMail !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { "buyer.email": email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/job/:id", async (req, res) => {
      const id = req.params.id;
      const JobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...JobData,
        },
      };
      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    //get all bids for a user by email from db
    app.get("/myBids/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    //get all bid request from db for job owner
    app.get("/bidRequest/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    //update bid status

    app.patch("/bid/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: status,
      };
      const result = await bidsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //get all jobs data from bd for pagination
    app.get('/all-jobs',async(req,res)=>{
      
      const size=parseInt(req.query.size) 
      const page=parseInt(req.query.page)-1
      console.log(size,page)
     
      const result=await jobsCollection.find().skip(size*page).limit(size).toArray()
      res.send(result)
    })

    //get all jobs data count from database

    app.get('/jobs-count',async(req,res)=>{
      const count=await jobsCollection.countDocuments()
      res.send({count})
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
