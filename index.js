const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors=require('cors')
const dotenv=require('dotenv')
const app = express();
const port =process.env.PORT || 5000;
dotenv.config()
app.use(express.json())
app.use(cors())
const uri=process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const db=client.db('rango-data')
    const collection=db.collection('products')
   
    await client.connect();

    // get all products
  app.get('/products',async(req,res)=>{
    try{
      const page = req.query.page
      const search = req.query.search
      const category = req.query.category;
      const brand = req.query.brand;
      const color = req.query.color;
      const sort = req.query.sort ;
     
     
      
      let query={}
      let sortOption ={}
      if (search) {
  query.name = { $regex: search, $options: 'i' };
}
console.log(search);
if (category) {
  query.category = category;
}
if (brand) {
      query.brand = brand;
    }
    if(sort === 'price-low-high'){
      sortOption={price : 1}
    }
    if(sort === 'price-high-low'){
      sortOption={price : -1}
    }
      if (sort === 'rating') {
    sortOption = { rating: -1 }
  }
  if(sort === 'name-asc'){
    sortOption={name:1}
  }
  if(sort === 'name-desc'){
    sortOption={name: -1}
  }

      const limit=12
      const skip=(page-1)* limit

        const cursor=await collection.find(query).sort(sortOption).skip(skip).limit(limit)
        const result=await cursor.toArray()
res.send(result)
    }catch(error){
     res.status(500).send({
        success:false,
        message:'Internal Server Error'
     })   
    }
  })
    // get top selling product
  app.get('/topProducts',async(req,res)=>{
    try{
        const cursor=await collection.find().sort({rating:-1}).limit(6)
        const result=await cursor.toArray()
res.send(result)
    }catch(error){
     res.status(500).send({
        success:false,
        message:'Internal Server Error'
     })   
    }
  })

  // get data by id

  app.get('/products/:id',async(req,res)=>{
   try{
     const id = req.params.id
    const query ={
      _id:new ObjectId(id)
    }
    const result=await collection.findOne(query)
    res.send(result)
   }catch(error){
     res.status(500).send({
        success:false,
        message:'Internal Server Error'
     })   
   }
  })
  // related product
  app.get('/related-products/:id',async(req,res)=>{
   try{
     const id = req.params.id
    const query ={
      _id:new ObjectId(id)
    }
    const currentProduct=await collection.findOne(query)
    const relatedProducts=await collection.find({
      category:currentProduct.category,
      _id:{$ne:query._id}
       }).limit(4).toArray()
    res.send(relatedProducts)
   }catch(error){
     res.status(500).send({
        success:false,
        message:'Internal Server Error'
     })   
   }
  })
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});