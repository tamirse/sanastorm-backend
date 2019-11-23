const express = require("express");
const db = require("./db");

const app = express();
const port = 3000;

app.get("/api/sana/:word", (req, res) => {
  console.log("Get: ", req.params);

  // TODO get then send word data
  db.getWordData(req.params.word)
    .then(wordData => res.send(wordData))
    .catch(e => res.send(e));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
