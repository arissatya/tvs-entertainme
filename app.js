if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const uri = process.env.DB_ATLAS;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("TV SERIES SERVER CONNECT " + PORT);
});

client.connect((err) => {
  const collection = client.db("tvs").collection("series");

  app.get("/", (req, res) => {
    collection.find({}).toArray(function (err, data) {
      if (err) console.error(err);
      res.status(200).json(data);
    });
  });

  app.post("/", (req, res) => {
    collection
      .insertOne({
        title: req.body.title,
        overview: req.body.overview,
        poster_path: req.body.poster_path,
        popularity: req.body.popularity,
        tags: req.body.tags,
      })
      .then(({ ops }) => {
        res.status(201).json(ops[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/:seriesId", (req, res) => {
    const seriesId = req.params.seriesId;
    collection
      .findOne({ _id: ObjectId(seriesId) })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.put("/:seriesId", (req, res) => {
    const seriesId = req.params.seriesId;
    collection
      .updateOne(
        { _id: ObjectId(seriesId) },
        {
          $set: {
            title: req.body.title,
            overview: req.body.overview,
            poster_path: req.body.poster_path,
            popularity: req.body.popularity,
            tags: req.body.tags,
          },
        }
      )
      .then(({ result }) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.delete("/:seriesId", (req, res) => {
    const seriesId = req.params.seriesId;
    collection
      .deleteOne({ _id: ObjectId(seriesId) })
      .then(({ result }) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
