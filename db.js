const { Pool } = require("pg");
const auth = require("./auth.json");

const pool = new Pool({
  user: auth.PGUSER,
  host: auth.PGHOST,
  database: auth.PGDATABASE,
  password: auth.PGPASSWORD,
  port: auth.PGPORT
});

const getNounInflections = word => {
  let query = `select nominative,genitive,partitive,
  inessive,elative,illative,adessive,ablative,allative,
  essive,translative,abessive,comitative from nouns 
  where $1::text in (nominative,genitive,partitive,
  inessive,elative,illative,adessive,ablative,allative,
  essive,translative,abessive,comitative,
  pl_nominative,pl_genitive,pl_partitive,pl_inessive,
  pl_elative,pl_illative,pl_adessive,pl_ablative,
  pl_allative,pl_essive,pl_translative,pl_instructive,
  pl_abessive)`;

  return new Promise((resolve, reject) => {
    pool
      .query(query, [word])
      .then(result => resolve(result.rows[0]))
      .catch(e => reject(e));
  });
};

const getNounEnglish = word => {
  let query = `select english from nouns_translations 
  where noun_nominative = $1::text`;

  return new Promise((resolve, reject) => {
    pool
      .query(query, [word])
      .then(result => resolve(result.rows[0]))
      .catch(e => reject(e));
  });
};

const getNounData = word => {
  let wordData = {
    inflections: null,
    english: null,
    partOfSpeech: "noun"
  };

  return new Promise((resolve, reject) => {
    getNounInflections(word)
      .then(inflections => {
        if (inflections) {
          wordData.inflections = inflections;
          return getNounEnglish(inflections.nominative);
        } else {
          resolve(null);
        }
      })
      .then(res => {
        wordData.english = res;
        resolve(wordData);
      })
      .catch(e => reject(e));
  });
};

const getVerbInflections = word => {
  let query = `select * from verbs 
  where $1::text in (
    pres_1sg, pres_2sg, pres_3sg,
    pres_1pl, pres_2pl, pres_3pl,
    pres_neg, pres_pass, pres_pass_neg,
    past_1sg, past_2sg, past_3sg,
    past_1pl, past_2pl, past_3pl,
    past_pass,
    cond_1sg, cond_2sg, cond_3sg_or_neg,
    cond_1pl, cond_2pl, cond_3pl,
    cond_pass, cond_pass_neg,
    impr_2sg, impr_3sg,
    impr_1pl, impr_2pl, impr_3pl,
    impr_2sg_neg, impr_neg,
    impr_pass, impr_pass_neg,
    potn_1sg, potn_2sg, potn_3sg,
    potn_1pl, potn_2pl, potn_3pl,
    potn_neg, potn_pass, potn_pass_neg,
    pres_part,
    pres_pass_part,
    past_part,
    past_pass_part,
    agnt_part,
    nega_part,
    inf1, inf1_long, inf2, inf2_pass, inf3, inf3_pass, inf4, inf5,
    "jA")`;

  return new Promise((resolve, reject) => {
    pool
      .query(query, [word])
      .then(result => resolve(result.rows[0]))
      .catch(e => reject(e));
  });
};

const getVerbEnglish = word => {
  let query = `select english from verbs_translations 
  where verb_infinitive = $1::text`;

  return new Promise((resolve, reject) => {
    pool
      .query(query, [word])
      .then(result => resolve(result.rows[0]))
      .catch(e => reject(e));
  });
};

const getVerbData = word => {
  let wordData = {
    inflections: null,
    english: null,
    partOfSpeech: "verb"
  };

  return new Promise((resolve, reject) => {
    getVerbInflections(word)
      .then(inflections => {
        if (inflections) {
          wordData.inflections = inflections;
          return getVerbEnglish(inflections.inf1);
        } else {
          resolve(null);
        }
      })
      .then(res => {
        wordData.english = res; // handle getVerbEnglish(..) promise
        resolve(wordData);
      })
      .catch(e => reject(e));
  });
};

const getWordData = word => {
  return new Promise((resolve, reject) => {
    const nounPromise = getNounData(word);
    const verbPromise = getVerbData(word);

    const nounPromiseLower = getNounData(word.toLowerCase());
    const verbPromiseLower = getVerbData(word.toLowerCase());

    Promise.all([nounPromise, verbPromise])
      .then(([nounData, verbData]) => {
        if (nounData) {
          resolve(nounData);
        } else if (verbData) {
          resolve(verbData);
        } else {
          // try again with lower case
          Promise.all([nounPromiseLower, verbPromiseLower]).then(
            ([nounData, verbData]) => {
              if (nounData) {
                resolve(nounData);
              } else {
                resolve(verbData);
              }
            }
          );
        }
      })
      .catch(e => reject(e));
  });
};

module.exports = {
  getWordData: getWordData
};
