const axios = require('axios')
const { MongoClient } = require('mongodb');

jest.setTimeout(60000);

let userConnection;
let userDB;
let cartConnection;
let cartDB;
const user = {
    host: 'user-db',
    port: 27017,
    databaseName: 'users',
    collectionName: 'customers',
    url: `mongodb://user-db:27017/`,
}
const cart = {
    host: 'carts-db',
    port: 27017,
    databaseName: 'data',
    collectionName: 'cart',
    url: `mongodb://carts-db:27017/`
}

//connects with user databse 
const connectUserDB = async () => {
    userConnection = await MongoClient.connect(user.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    userDB = await userConnection.db(user.databaseName);
}
// connects with cart databse
const connectCartDB = async () => {
    cartConnection = await MongoClient.connect(cart.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    cartDB = await cartConnection.db(cart.databaseName);
}

// removes the collection making the user db empty
const resetUserDB = async () => {
    await userDB.collection("customers").deleteOne({ username: "myname" });
}
// removes the collection making the cart db empty
const resetCartDB = async () => {
    await cartDB.collection("cart").deleteMany({});
}

describe("Cart and User tests", () => {
    beforeAll(async () => {
        await connectUserDB();
        await connectCartDB();
    })
    beforeEach(async () => {
        await resetUserDB();
        await resetCartDB();
    });

    it("GET /customers returns all the registered users", async () => {
        const response = await axios.get("http://front-end:8079/customers")

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("_embedded.customer");
    })

    it("GET /login logs in a registered user and returns with a cookie", async () => {
        const response = await axios.get("http://front-end:8079/login", {
            auth: {
                // already in the db user
                username: 'user',
                password: 'password'
            },
        });

        expect(response.status).toBe(200);
        expect(response.data).toBe("Cookie is set");
        expect(response.headers['set-cookie']).toBeTruthy();
    })

    it("POST /register registers a new user and checks in the database", async () => {
        let user = {
            username: "myname",
            password: "mypass",
            firstName: "myfname",
            lastName: "mylname",
            email: "my@mail.com"
        }
        const response = await axios.post("http://front-end:8079/register", user);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("id");

        // checking if the user is inserted in the DB
        const data = userDB.collection("customers").findOne({ username: "myname" });

        expect(data).toBeTruthy();
    })

    it('POST /cart adds items to the cart for the logged user', async () => {
        const loginRes = await axios.get("http://front-end:8079/login", {
            auth: {
                username: 'user',
                password: 'password'
            },
        });
        console.log(loginRes.headers['set-cookie']);
        // to get the cookie logged_in from the response
        const cookie = loginRes.headers['set-cookie'];
        const loggedCookie = cookie.toString().split('; ')
        const cookiees = loggedCookie[0].split('=')
        expect(loginRes.status).toBe(200);

        // sends product id and the cookie to ass to cart
        const cartRes = await axios.post('http://front-end:8079/cart',
            {
                // item id from catalogue db
                id: "03fef6ac-1896-4ce8-bd69-b798f85c6e0b"
            },
            {
                headers: {
                    cookies: cookiees[1]
                }
            },
        )
        expect(cartRes.status).toBe(201);

        // checking in the db if it got stored
        const data = await cartDB.collection("cart").count();
        console.log(data)
        expect(data).toBe(1);
    })

    it("DELETE /cart removes an item from the cart for logged user", async () => {
        const loginRes = await axios.get("http://front-end:8079/login", {
            auth: {
                username: 'user',
                password: 'password'
            },
        });
        console.log(loginRes.headers['set-cookie']);
        // to get the cookie logged_in from the response
        const cookie = loginRes.headers['set-cookie'];
        const loggedCookie = cookie.toString().split('; ')
        const cookiees = loggedCookie[0].split('=')
        expect(loginRes.status).toBe(200);

        // sends product id and the cookie to ass to cart
        const cartRes = await axios.delete('http://front-end:8079/cart',
            {
                headers: {
                    cookies: cookiees[1]
                },
                params: {
                    // item id from catalogue db
                    id: "03fef6ac-1896-4ce8-bd69-b798f85c6e0b"
                }
            },
        )
        expect(cartRes.status).toBe(202);

        // checking in the db if it got removed
        const data = await cartDB.collection("cart").count();
        console.log(data)
        expect(data).toBe(0);
    })

    afterAll(async () => {
        await cartConnection.close();
        await userConnection.close();
    });
})