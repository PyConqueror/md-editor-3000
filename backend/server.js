require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.DATABASE_URI;
const dbName = process.env.DATABASE_NAME;
const collectionName = process.env.COLLECTION_NAME;

let db, collection;

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  collection = db.collection(collectionName);
}

app.get('/api/press-release-ids', async (req, res) => {
  try {
    const docs = await collection.find({}, {
      projection: { _id: 1, title: 1, date_published: 1 }
    }).sort({ date_published: 1 }).toArray();

    const formatted = docs.map(doc => ({
      id: doc._id,
      title: doc.title,
      date_published: doc.date_published,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/press-release/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/press-release/save/:id', async (req, res) => {
  const { id } = req.params;
  const { markdown } = req.body;

  if (typeof markdown !== 'string') {
    return res.status(400).json({ error: 'Invalid markdown content' });
  }

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "content.markdown": markdown } }
    );
    if (result.modifiedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'No document updated' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/press-release/save-plain/:id', async (req, res) => {
  const { id } = req.params;
  const { plain } = req.body;

  if (typeof plain !== 'string') {
    return res.status(400).json({ error: 'Invalid plain content' });
  }

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "content.plain": plain } }
    );
    if (result.modifiedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'No document updated' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


connectDB().then(() => {
  app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
  });
});
