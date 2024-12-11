const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.qvnsypp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("FindHere").collection("users");
    const jobCollections = client.db("FindHere").collection("createJob");
    const divisionsCollections = client.db("FindHere").collection("divisions");
    const districtsCollections = client.db("FindHere").collection("districts");
    const upazilasCollections = client.db("FindHere").collection("upazilas");

    // jwt related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // middlewares
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }

      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "forbidden access" });
        }

        req.decoded = decoded;
        next();
      });
    };

    //country data
    app.get("/divisions", async (req, res) => {
      const result = await divisionsCollections.find().toArray();
      res.send(result);
    });

    app.get("/districts/:id", async (req, res) => {
      const divisionId = req.params.id;

      const query = { division_id: divisionId };

      const result = await districtsCollections.find(query).toArray();

      res.send(result);
    });
    app.get("/upazilas/:id", async (req, res) => {
      const districtId = req.params.id;

      const query = { district_id: districtId };

      const result = await upazilasCollections.find(query).toArray();

      res.send(result);
    });

    app.get("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;

      const query = { email };

      const result = await usersCollection.findOne(query);

      if (!result) {
        console.log("No matching user found for email:", email);
        return res.status(404).send({ message: "User not found" });
      }

      res.send(result);
    });

    app.post("/addUser", async (req, res) => {
      const userInfo = req.body;
      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    //job related api

    app.get("/createJob/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { holderEmail: email };

      const result = await jobCollections.find(query).toArray();

      res.send(result);
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollections.findOne(query);

      res.send(result);
    });

    app.post("/createJob", async (req, res) => {
      const jobData = req.body;

      const result = await jobCollections.insertOne(jobData);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`Server is working on port ${port}`);
});
