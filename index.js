const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

// middleware start
const corsOptions = {
  origin: ["http://localhost:5173/", "http://localhost:5174/"],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).send("Access denied. No token provided. bujchos");
  jwt.verify(token, process.env.TOKEN, (err, decoded) => {
    if (err)
      return res.status(403).send("Access denied. Invalid token. bujchos");
    req.user = decoded;
    next();
  });
};
// middleware end

// MongoDB start

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sp25joa.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();

    const dataDB = client.db("zay").collection("products");

    app.post("/jwt", async (req, res) => {
      const email = req.body.email;
      const token = jwt.sign(email, process.env.TOKEN, { expiresIn: " 365d" });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production " ? "none" : "strict",
        })
        .send({ message: "success fully send token" });
    });

    // logout and token cleanup
    app.post("/logout", async (req, res) => {
      try {
        res.clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// MongoDB end

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
