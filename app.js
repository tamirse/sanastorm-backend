const express = require("express");
const db = require("./db");

const app = express();
const port = 3000;

app.get("/api/sana/:word", (req, res) => {
  db.getWordData(req.params.word)
    .then(wordData => res.send(wordData))
    .catch(e => res.send(e));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
