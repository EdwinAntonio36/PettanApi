const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://root:example@db:27017/';
const dbName = 'test'; 
const collectionName = 'Pettan';

MongoClient.connect(url, { useUnifiedTopology: true }, async (err, client) => {
    if (err) throw err;

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const count = await collection.countDocuments();  // Verifica cuántos documentos hay

    if (count === 0) {  // Solo inserta si la colección está vacía
        const pettans = JSON.parse(fs.readFileSync('./pettans.json', 'utf8'));
        collection.insertMany(pettans, (err, res) => {
            if (err) throw err;
            console.log(`${res.insertedCount} Cartas Pettan insertadas`);
            client.close();
        });
    } else {
        console.log("No se insertaron datos, la colección ya contiene registros.");
        client.close();
    }
});



