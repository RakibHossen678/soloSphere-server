const { MongoClient, ServerApiVersion } = require("mongodb");
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
