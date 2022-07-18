# sock-shop-integration-test
use <code>docker-compose up --build</code> to up and run the test
or just run <code>./test.sh</code> file to start the test.

### It uses frontend, user, cart and catalogue module for this integration test
  <code>GET /customers</code> 
  <li>it  returns all the registered users</li>
  <code>GET /login</code> 
  <li>it logs in a registered user and returns with a cookie</li>
  <code>POST /register</code> 
  <li>it registers a new user and checks in the database</li>
  <code>POST /cart</code> 
  <li>it adds items to the cart for the logged user</li>
  <code>DELETE /cart</code>
  <li>it removes an item from the cart for logged user</li>