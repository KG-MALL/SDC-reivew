import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2s', target: 200 },
    { duration: '5s', target: 1000 },
    { duration: '5s', target: 1000 },
    { duration: '2s', target: 0 }
  ],
};

function getRandomReviewBody() {
  return {
    product_id: Math.floor(Math.random() * 100000),
    rating: Math.floor(Math.random() * 5) + 1,
    date: Date.now(),
    summary: "This is a test review summary",
    body: "This is a test review body",
    recommend: Math.random() > 0.5,
    reviewer_name: "TestReviewer",
    reviewer_email: "test@example.com",
    response: "Thank you for your review"
  };
}




export default function () {
  http.get(`http://localhost:3000/reviews?product_id=${Math.floor(Math.random() * 100000)}`);
  http.get(`http://localhost:3000/reviews/meta?product_id=${Math.floor(Math.random() * 100000)}`);

  const headers = { "Content-Type": "application/json" };
  const requestBody = getRandomReviewBody();
  http.post(`http://localhost:3000/reviews`, JSON.stringify(requestBody), { headers: headers });

  // if (response.status !== 200) {  // Assuming 200 is a success status; adjust as needed
  //   console.error(`Error posting review. Status: ${response.status}`);
  //   console.error(`Request Body: ${JSON.stringify(requestBody)}`);
  //   console.error(`Response Body: ${response.body}`);
  // } else {
  //   console.log(`Successfully posted review for product_id: ${requestBody.product_id}`);
  // }

  sleep(1);
}
