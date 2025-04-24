const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@cluster0.gfesh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const productCollection = client.db('productDB').collection('products');

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Root route
    app.get('/', (req, res) => {
      res.send('Simple server is running');
    });

    // Product section
    app.get('/products', async (req, res) => {
      const { category } = req.query;
      
      let filter = {};
      if (category) {
        filter.category = category;  // Filter products by category
      }

      try {
        const products = await productCollection.find(filter).toArray();
        res.json(products);  // Return the filtered products
      } catch (err) {
        res.status(500).json({ message: "Error fetching products", error: err });
      }
    });

    // Add a new product
    app.post('/products', async (req, res) => {
      const product = req.body;
      try {
        const result = await productCollection.insertOne(product);
        res.json(result); // Send the result of insertion
      } catch (err) {
        res.status(500).json({ message: "Error adding product", error: err });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Simple server is running on port: ${port}`);
});
