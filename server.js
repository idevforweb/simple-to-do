const // Express app set up
  express = require("express"),
  app = express();

// set up mongodb
const { MongoClient, ObjectId } = require("mongodb");

// Global Variables
let db;

// Connect to DB
async function go() {
  const connectLink =
    "mongodb+srv://todoappuser:@cluster0.baubb.mongodb.net/TodoApp?retryWrites=true&w=majority";
  // Create mongo instaance client and connect using snippet
  const client = new MongoClient(connectLink);
  // Wait for connection to fully connect
  await client.connect();
  // init global dv var
  db = client.db();
  app.listen(5000);
}

go();

app.use(express.json());
// add body object that gets added on to the req object
app.use(express.urlencoded({ extended: true }));
// make contents of public folder available from root
app.use(express.static("public"));

app.get("/", function (req, res) {
  // Talk to db, we want to load data first.
  // get data from db and convert to array

  db.collection("items") // connect to collection
    .find()
    // toArray method with callback function
    .toArray(function (err, items) {
      //  add html template so we can add items from array
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple To-Do App</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
        <body>
          <div class="container">
            <h1 class="display-4 text-center py-1">To-Do App</h1>
            
            <div class="jumbotron p-3 shadow-sm">
              <form id="create-form" action="create-item" method="POST">
                <div class="d-flex align-items-center">
                  <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                  <button class="btn btn-primary">Add New Item</button>
                </div>
              </form>
            </div>
            
            <ul id="item-list" class="list-group pb-5">
 
        
            </ul>
            
          </div>
          <script>
              let items = ${JSON.stringify(items)}
          </script>
          <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
          <script src="/browser.js"></script>
        </body>
        </html>
    `);
    });

  // Send template when '/', request
});

// actions to perform on post
app.post("/create-item", function (req, res) {
  // Storing items to database
  db.collection("items").insertOne({ text: req.body.text }, (err, info) => {
    res.json({ _id: info.insertedId, text: req.body.text });
  });
});

// post updated items.
app.post("/update-item", function (req, res) {
  db.collection("items").findOneAndUpdate(
    { _id: new ObjectId(req.body.id) },
    { $set: { text: req.body.text } },
    function () {
      res.send("Success");
    }
  );
});

app.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne(
    { _id: new ObjectId(req.body.id) },
    function () {
      res.send("Delete Success");
    }
  );
});
