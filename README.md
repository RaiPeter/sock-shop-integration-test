# sock-shop-integration-test
use <code>docker-compose up --build</code> to up and run the test

## It has 4 normal test as follows: 
### User 
  <code>GET /</code> 
  <li>it hits the home page and returns 200 status code.</li>
  <code>POST /register</code> 
  <li>it registers a new user and returns a 200 status code.</li>
  <code>GET /login</code> 
  <li>it logs in the registered user and retruns a 200 status code.</li>
  <code>GET /login</code>
  <li>it logs in a user with wrong credential and returns 401 status code.</li>

### Cart
  <code>GET /cart</code> 
  <li>it returns all the items in the cart with 200 status code.</li>
  <code>POST /cart</code> 
  <li>it adds an item to the cart with 200 status code.</li>
  <code>DEL /cart</code> 
  <li>it deletes the cart itself, removing all the items with 200 status code.</li>
  <code>DEL /cart/:id</code> 
  <li>it deletes an item from the cart and returns a 200 status code.</li>