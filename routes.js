const express = require('express');
const app = express();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

//check connection
pool.connect()
.then(() => console.log('Connected to database'))
.catch(err => console.error('Database connection error:', err));


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

//middleware
app.use(express.json());

// //test
// app.get('/test', (req, res) => {
//   res.send('Test endpoint works!');
// });


//endpoints
//GET reviews
app.get('/reviews', (req, res) => {
  const productId = req.query.product_id; // Getting the product_id from query parameter

  if (!productId) {
      return res.status(400).send('product_id is required as a query parameter.');
  }

  // SQL query with a placeholder ($1) for the product_id
  // use this parameterized queries (like $1) to prevent SQL injection risks.
  const query = `
      SELECT * FROM reviews
      WHERE product_id = $1;
  `;

  pool.query(query, [productId])
      .then(result => {
          res.json(result.rows);
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Server Error');
      });
});


//GET review meta
app.get('/reviews/meta', (req, res) => {
    //req.query takes what after ? where req.params take what between ? and last /
    const productId = req.query.product_id;

    const ratingsQuery = `
        SELECT rating, COUNT(rating)
        FROM reviews
        WHERE product_id = $1
        GROUP BY rating;
    `;

    const recommendQuery = `
        SELECT recommend, COUNT(recommend)
        FROM reviews
        WHERE product_id = $1
        GROUP BY recommend;
    `;

    const characteristicsQuery = `
        SELECT c.name, cr.characteristic_id, ROUND(avg(cr.value), 4) AS value
        FROM characteristics c
        JOIN characteristic_reviews cr ON c.id = cr.characteristic_id
        WHERE c.product_id = $1
        GROUP BY c.name, cr.characteristic_id;
    `;

    Promise.all([
      pool.query(ratingsQuery, [productId]),
      pool.query(recommendQuery, [productId]),
      pool.query(characteristicsQuery, [productId])

    ])

    .then(([ratingsResult, recommendResult, characteristicsResult]) => {
      const responseObj = {
          product_id: productId,
          ratings: {},
          recommended: {},
          characteristics: {}
      };

      ratingsResult.rows.forEach(row => {
          responseObj.ratings[row.rating] = row.count;
      });

      recommendResult.rows.forEach(row => {
          responseObj.recommended[row.recommend] = row.count;
      });

      characteristicsResult.rows.forEach(row => {
          responseObj.characteristics[row.name] = {
              id: row.characteristic_id,
              value: row.value ? row.value : null
          };
      });

      res.json(responseObj);
  })
      .catch(err => {
          console.error(err);
          res.status(500).send('Server Error');
      });
});

//POST
app.post('/reviews', (req, res) => {
  const { product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email, response} = req.body;

  if(!product_id || !rating || !date || !summary || !body || recommend == null || !reviewer_name || !reviewer_email) {
      return res.status(400).send('Missing required fields/');
  }

  const query = `
      INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email, response)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
  `;

  pool.query(query, [product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email, response])
      .then(result => {
          res.status(201).send({ message: 'Review created successfully!', reviewId: result.rows[0].id });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Server Error');
      });
});

//PUT
app.put('/reviews/:review_id/helpful', (req, res) => {
  const reviewId = req.params.review_id;
  const query = `
      UPDATE reviews
      SET helpfulness = helpfulness + 1
      WHERE id = $1;
  `;

  pool.query(query, [reviewId])
      .then(result => {
          if (result.rowCount === 0) {
              return res.status(404).send('Review not found');
          }
          res.send({ message: 'Review saved', updatedHelpfulness: result.rows[0].helpfulness });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Server Error');
      });
});


app.put('/reviews/:review_id/report', (req, res) => {
  const reviewId = req.params.review_id;
  const query = `
      UPDATE reviews
      SET reported = TRUE
      WHERE id = $1;
  `;
  pool.query(query, [reviewId])
      .then(result => {
          if (result.rowCount === 0) {
              return res.status(404).send('Review not found.');
          }
          res.send({ message: 'Review reported!', reportedStatus: result.rows[0].reported });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Server Error');
      });
});



module.exports = app;