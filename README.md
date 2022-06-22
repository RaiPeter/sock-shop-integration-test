# sock-shop-integration-test
use <code>docker-compose up --build</code> to up and run the test

## It has 4 normal test as follows: 
  <code>GET /</code> 
  <li>it hits the home page and returns 200 status code.</li>
  <code>POST /register</code> 
  <li>it registers a new user and returns a 200 status code.</li>
  <code>GET /login</code> 
  <li>it logs in the registered user and retruns a 200 status code.</li>
  <code>GET /login</code>
  <li>it logs in a user with wrong credential and returns 401 status code.</li>
