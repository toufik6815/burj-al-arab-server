const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const admin = require("firebase-admin");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.px7nq.mongodb.net/burjAlArab?retryWrites=true&w=majority`;


const app = express();
app.use(bodyParser.json());
app.use(cors());





const serviceAccount = require("./configs/burj-al-arabic-firebase-adminsdk-jybcz-ccaf78a466.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB,
});









const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  

  //Add
  app.post("/addBooking", (req, res) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })


  //Read
  app.get('/bookings', (req, res) => {

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        
        admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {

        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;

        if(tokenEmail == queryEmail){
               bookings.find({ email: queryEmail })
                    .toArray((err, documents) => {
                        res.status(200).send(documents);
                    });
        }

        else{
            res.status(401).send("un-authorized access!");
        }

        })

      .catch(function (error) {
        res.status(401).send("un-authorized access!");
      });
    }

    
    else{
        res.status(401).send('un-authorized access!')
    }
    

   
  })


});


















//Hosting
app.listen(5000);