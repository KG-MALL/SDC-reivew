const chai = require('chai');
const expect = chai.expect;
const app = require('../routes.js');
const axios = require('axios');


describe('Reviews API', function() {

  //GET /reviews
  it('GET /reviews - should fetch reviews for a product', async function() {
    const response = await axios.get('http://localhost:3000/reviews?product_id=40345');

    expect(response.status).to.equal(200);
    expect(response.data).to.be.an('array');
  });

  it('GET /reviews - should respond with 400 if no product_id is provided', async function() {
      try {
          await axios.get('http://localhost:3000/reviews');
      } catch (error) {
          expect(error.response.status).to.equal(400);
      }
    });

  //POST /reviews
  describe('POST /reviews', function() {
    it('should create a review and return its id', function(done) {
        const reviewData = {
            product_id: 40345,
            rating: 5,
            date: "2023-08-28",
            summary: "Great product!",
            body: "I really enjoyed this product. It works perfectly.",
            recommend: true,
            reviewer_name: "John",
            reviewer_email: "john@example.com",
            response: "Thank you!"
        };

        axios.post('http://localhost:3000/reviews', reviewData)
            .then(res => {
                expect(res.status).to.equal(201);
                expect(res.data.reviewId).to.exist;
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});





  //GET reiview/meta
  //put
});
