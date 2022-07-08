# sock-shop-integration-test
use <code>docker-compose up --build</code> to up and run the test

### It uses user and cart module for integration test
  <code>GET /cart</code> 
  <li>it returns all the items in the cart with 200 status code.</li>
  <code>DEL /cart</code> 
  <li>it deletes the cart itself, removing all the items with 200 status code.</li>
  <code>DEL /cart/:id</code> 
  <li>it deletes an item from the cart and returns a 200 status code.</li>
  <code>POST /cart</code> 
  <li>it adds an item to the cart with 200 status code.</li>