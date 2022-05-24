const express= require('express');
const app=express();
const cors=require('cors');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const port=process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient } = require('mongodb');
const { query } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3cuoy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      
      await client.connect();
      const database = client.db("e-shop");
      const productCollection = database.collection("products");
      const flashsellCollection=database.collection("flashsell");
      const flashsellTime=database.collection("flashsellTime");
      const orderCollection=database.collection("orders");
      const usersCollection=database.collection("users");
      const categoryCollection=database.collection("category");
      const bannerCollection=database.collection("banner");

      console.log('connect to db');

      //get all products
      app.get('/products',async(req,res)=>{

        const category=req.query.category;
        const name=req.query.name;
        

        const page=req.query.page;
        const size=parseInt(req.query.size);
        
        let count;
     
        let products;

        if(name){
          const query={name:name};
          // const cursor=productCollection.find(query);
          products=await productCollection.find(query).toArray();
          res.send(products);

        }

        else if(category){

           const query= {category:category};
           const cursor=productCollection.find(query);
           products= await cursor.toArray();
           res.send(products);
         }
        
        
        else if(page){
          const cursor=productCollection.find({});
          const countdata=await productCollection.countDocuments({})
          products=await cursor.skip(page*size).limit(size).toArray();
          res.send({countdata,products});
        }
        
        else{
          const cursor=productCollection.find({});
          products=await cursor.toArray();
          res.send(products);
        }
        
        // res.send({
        //   count,products
        // });

      });

      //get selected product
      app.get('/products/:id',async(req,res)=>{
        const id=req.params.id;
        const quary={_id:ObjectId(id)};
        const result=await productCollection.findOne(quary);
        res.send(result);

      });

      app.post('/products',async(req,res)=>{
        const cursor=req.body;
        const result=await productCollection.insertOne(cursor);
        res.json(result);

      });

      app.delete('/products/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await productCollection.deleteOne(query);
        res.json(result);
      })

      // app.post('/products',async(req,res)=>{
      //   const name=req.body.name;
      //   const seller=req.body.seller;
      //   const price=req.body.price;
      //   const shipping=req.body.shipping;
      //   const category=req.body.category;
      //   const stock=req.body.stock;
      //   const star=req.body.star;
      //   const starCount=req.body.starCount;
      //   const features=req.body.features;
       
      //   // console.log('body',req.body);
      //   // console.log('files',req.files);
      //   const pic=req.files.image;
      //   const picData=pic.data;
      //   const encodedPic= picData.toString('base64');
      //   const imageBuffer=Buffer.from(encodedPic,'base64');
      //   const productInfo={
      //     name,seller,price,shipping,category,stock,star,starCount,features,image:imageBuffer
      //   }

      //   const result=await productCollection.insertOne(productInfo);
      //   console.log(productInfo);

      //   res.json({success:true});

      // });

      
      //get flshsell product

      app.get('/flashsell',async(req,res)=>{
        const result=await flashsellCollection.find({}).toArray();
        res.send(result);

      });

      //get selected product

      app.get('/flashsell/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await flashsellCollection.findOne(query);
        res.send(result);

      });

      // post flashsell
      app.post('/flashsell',async(req,res)=>{
        const cursor=req.body;
        const result=await flashsellCollection.insertOne(cursor);
        res.json(result);

      });

      // delete sell product

      app.delete('/flashsell/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await flashsellCollection.deleteOne(query);
        res.json(result);
      })

      app.post('/flashsellTime',async(req,res)=>{
        const sellTime=req.body;
        const result=await flashsellTime.insertOne(sellTime);
        console.log(result);
        res.json(result);
      })

      app.get('/flashsellTime',async(req,res)=>{
        const result=await flashsellTime.find({}).toArray();
        res.json(result);
      })
      app.delete('/flashsellTime',async(req,res)=>{
        const result=await flashsellTime.deleteMany({});
        res.json(result);
      })

      app.get('/orders',async(req,res)=>{
        const email=req.query.email;
        let cursor;

        if(email){
          const query={email:email};
          cursor=orderCollection.find(query);

        }else{
          cursor=orderCollection.find({});
        }
        
        
        const result= await cursor.toArray();
        res.send(result);

      });


      app.post('/orders',async(req,res)=>{
        const orderPlace=req.body;
        const result=await orderCollection.insertOne(orderPlace);
        res.json(result);

      });

      // app.get('/orders/:id',async(req,res)=>{



      // })

      app.delete('/orders/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await orderCollection.deleteOne(query);
        res.send(result);
      });


      // post user
      app.post('/users',async(req,res)=>{
        const hashPassword=await  bcrypt.hash(req.body.password, 10);
        const user=req.body;
        const newUser=({
          displayName:req.body.displayName,
          email:req.body.email,
          password:hashPassword,
        });

        console.log(newUser);
        const result=await usersCollection.insertOne(newUser);
        res.json(result);

    });

    // users find
      app.get('/users',async(req,res)=>{
        const email=req.query.email;
        const password=req.query.password;
        // console.log(email,password);

        if(email){
          const query={email:email};
          // console.log(query);
           const findUser=await usersCollection.findOne(query);
           if(findUser){
              const validPassword=await bcrypt.compare(req.query.password,findUser.password);
              if(validPassword){
                const token= jwt.sign({ 
                  email:findUser.email,
                  displayName:findUser.displayName,
                  userId:findUser._id

                }, process.env.JWT_SECRET,{
                  expiresIn: '1h'
                })
                // console.log(token);
                res.status(200).json({
                  'user':findUser,
                  'access_token': token,
                  'message':'login successfully!'
                })
                

              }


           }
           

        }else{
          const result=await usersCollection.find({}).toArray();
          res.json(result);

        }
        
    

    });

    //user put
    app.put('/users',async(req,res)=>{
            
        const user=req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
       
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);

        res.json(result);
    });

    

    // make user admin
    app.put('/users/admin',async(req,res)=>{
        const user=req.body;
        console.log(user)
        const filter={email: user.email};
        const updateDoc={$set:{role:"admin"}};
        const result=await usersCollection.updateOne(filter,updateDoc);
        console.log(result);
        res.json(result);
               
    });
    //check user admin
    app.get('/users/:email',async(req,res)=>{
    
        const email=req.params.email;
        const query={email: email};
        const user=await usersCollection.findOne(query);
        let isAdmin= false;
        if(user?.role ==='admin'){
            isAdmin=true;
        }
        res.send({admin: isAdmin});
    });


    // get category
    app.get('/category',async(req,res)=>{
      const result=await categoryCollection.find({}).toArray();
      res.send(result);
    });

    // get selected category
    app.get('/category/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:ObjectId(id)};
      const result=await categoryCollection.findOne(query);
      res.send(result);
    });

    // post category
    app.post('/category',async(req,res)=>{
      const category=req.body;
      const result=await categoryCollection.insertOne(category);
      res.json(result);

    });
    
    // delete category
    app.delete('/category/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:ObjectId(id)};
      const result=await categoryCollection.deleteOne(query);
      res.send(result);
    });

    // get banner
    app.get('/banner',async(req,res)=>{
      const result=await bannerCollection.find({}).toArray();
      res.send(result);
    });

    // get selected banner
    app.get('/banner/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:ObjectId(id)};
      const result=await bannerCollection.findOne(query);
      res.send(result);
    });

    // post banner
    app.post('/banner',async(req,res)=>{
      const banner=req.body;
      const result=await bannerCollection.insertOne(banner);
      res.json(result);

    });
    
    // delete banner
    app.delete('/banner/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:ObjectId(id)};
      const result=await bannerCollection.deleteOne(query);
      res.send(result);
    });



      console.log("Connected successfully to server");


    } finally {
     
    //  await client.close();
    }
  }
  run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('Hello e-shop');
});

app.listen(port,()=>{
    console.log(`connect to port ${port}`);
})