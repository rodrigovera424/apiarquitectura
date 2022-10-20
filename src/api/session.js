const { MongoClient, ServerApiVersion } = require("mongodb");
const process = require("process");

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// eslint-disable-next-line no-unused-vars
client.connect((err) => {
  const collection = client.db("test").collection("users");
  console.log(collection);
  client.close();
});
