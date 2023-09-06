-- DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS characteristics CASCADE;
DROP TABLE IF EXISTS characteristic_reviews;
DROP TABLE IF EXISTS reviews_photos;


CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date BIGINT NOT NULL,  -- DEFAULT CURRENT_TIMESTAMP
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  recommend BOOLEAN NOT NULL,
  reported BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  response TEXT,
  helpfulness INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS characteristics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INTEGER NOT NULL REFERENCES characteristics(id),
  review_id INTEGER NOT NULL REFERENCES reviews(id),
  value DECIMAL(4,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews_photos (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id),
  url TEXT NOT NULL
);


-- Load data into main tables that don't have foreign key constraints

COPY reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
FROM '/Users/paulayang/csv-review/reviews.csv' DELIMITER ',' CSV HEADER;

COPY characteristics(id, product_id, name)
FROM '/Users/paulayang/csv-review/characteristics.csv' DELIMITER ',' CSV HEADER;


-- Insert data for characteristic_reviews
COPY characteristic_reviews(id, characteristic_id, review_id, value)
FROM '/Users/paulayang/csv-review/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;

COPY reviews_photos(id, review_id, url)
FROM '/Users/paulayang/csv-review/reviews_photos.csv' DELIMITER ',' CSV HEADER;

