const express = require("express");
const db = require("./db");
const omorfiHandler = require("./omorfi_handler");

const app = express();
const port = 3000;

app.get("/api/sana/:word", (req, res) => {
  let word = req.params.word;

  const omorfiWordData = omorfiHandler.getWordData(word);

  // if omorfiWordData contains the word string, replace the word with it,
  // since omorfi gives us the word in Nominative or Infinitive form (that's good!)
  if (omorfiWordData.word !== null) {
    word = omorfiWordData.word;
  }

  db.getWordData(word)
    .then(wordData => {
      wordData["omorfi"] = omorfiWordData;
      res.send(wordData);
    })
    .catch(e => res.send(e));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
