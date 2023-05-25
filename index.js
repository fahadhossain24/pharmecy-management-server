const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qs57ayo.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const medicines = client.db('pharmacy-management').collection('medicine')
    const cartMedicine = client.db('pharmacy-management').collection('cartMedicine');

    app.put('/entryMedicine', async (req, res) => {
      let medicineData = req.body;
      const newQuantity = parseInt(medicineData?.quantity);
      const query = { name: medicineData.name, power: medicineData.power };
      const currentMedicineData = await medicines.findOne(query);
      const prevQuantity = parseInt(currentMedicineData?.quantity);
      const totalQuantity = newQuantity + prevQuantity || newQuantity;
      medicineData.quantity = totalQuantity;
      const filter = {
        name: medicineData.name,
        power: medicineData.power,
      }
      const options = { upsert: true };
      const updateDoc = {
        $set: medicineData,
      }
      // console.log(medicineData.name, medicineData.power);
      const result = await medicines.updateOne(filter, updateDoc, options);
      res.send(result);
    })


    app.put('/updateQunatity', async (req, res) => {
      const medicineData = req.body;
      const filter = {
        name: medicineData.name,
        power: medicineData.power,
      }
      const options = { upsert: true };
      const updateDoc = {
        $set: medicineData,
      }
      // console.log(medicineData.name, medicineData.power);
      const result = await medicines.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get('/entryMedicine', async (req, res) => {
      const query = {};
      const cursor = medicines.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/entryMedicine/:name/:power', async (req, res) => {
      const medicineName = req.params.name;
      const medicinePower = req.params.power;
      // console.log(medicineName, medicinePower)
      const query = { name: medicineName, power: medicinePower };
      const result = await medicines.deleteOne(query);
      res.send(result);
    })

    app.post('/cartMedicine', async (req, res) => {
      const medicine = req.body;
      const result = await cartMedicine.insertOne(medicine);
      res.send(result);
    })

    app.get('/cartMedicine', async (req, res) => {
      const query = {};
      const cursor = cartMedicine.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/cartMedicine', async (req, res) => {
      const query = {};
      const result = cartMedicine.deleteMany(query);
      res.send(result);
    })

    app.get('/searchMedicine/:name/:power', async (req, res) => {
      const medicineName = req.params.name;
      const medicinePower = req.params.power;
      const query = {
        name: medicineName,
        power: medicinePower,
      };
    
      const result = await medicines.findOne(query);
      // console.log(query)
      if (result !== null) {
        res.send(result);
      } else {
        res.send({ message: 'Sorry, Medicine not found' })
      }
    })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server running')
})

app.listen(port, () => {
  console.log('server running at port', port);
})