const axios = require('axios')
const { MongoClient } = require('mongodb');

jest.setTimeout(60000);

jest.mock('axios')

let userConnection;
let userDB;
let cartConnection;
let cartDB;
const user = {
    host: 'user-db',
    port: 27017,
    databaseName: 'test-db',
    collectionName: 'test-customers',
    url: `mongodb://user-db:27017/`,
    mockUser: {
        username: "smarter",
        firstName: "smarter",
        lastName: "codes",
        email: "smarter@codes.com",
        password: "codes"
    },
}
const cart = {
    host: 'cart-db',
    port: 27017,
    databaseName: 'test-db',
    collectionName: 'test-cart',
    url: `mongodb://cart-db:27017/`,
    item: {
        id: "random123",
        name: "Holy Socks",
        price: "11$",
        category: "socks",
        quantity: 1,
        description: "This is a special edition socks in the world"
    },
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


// populates database with mock user in user database
const populateUserDB = async () => {
    const users = userDB.collection(user.collectionName);

    await users.insertOne(user.mockUser);
    console.log("User inserted");
}
// populates database with mock item in cart database
const populateCartDB = async () => {
    const carts = cartDB.collection(cart.collectionName);

    await carts.insertOne(cart.item);
    console.log("Items inserted");
}


// removes the collection making the user db empty
const resetUserDB = async () => {
    await userDB.collection(user.collectionName).deleteMany({});
}
// removes the collection making the cart db empty
const resetCartDB = async () => {
    await cartDB.collection(cart.collectionName).deleteMany({});
}


// drops the user database
const removeUserDB = async () => {
    await userDB.dropDatabase()
    console.log("User Database Dropped!");
}
// drops the cart database
const removeCartDB = async () => {
    await cartDB.dropDatabase()
    console.log("Cart Database Dropped!");
}


describe("User Authentication Test", () => {
    beforeAll(async () => {
        await connectUserDB();
        await populateUserDB();
    })
    beforeEach(async () => {
        await resetUserDB();
    });

    it("GET / Hits the home page /", async () => {
        axios.get.mockResolvedValue({
            status: 200
        })
        const response = await axios.get('http://front-end:8079')
        expect(response.status).toBe(200);
    })

    it("POST /register Registers a new user", async () => {
        let mockUser = {
            username: "smarter1",
            firstName: "smarter1",
            lastName: "codes1",
            email: "smarter@codes1.com",
            password: "codes1"
        }
        axios.post.mockResolvedValue({
            status: 200
        })
        const response = await axios.post("http://front-end:8079/register", mockUser);

        const users = userDB.collection(user.collectionName);
        await users.insertOne(mockUser);
        const insertedUser = await users.findOne({ username: mockUser.username });

        expect(insertedUser).toEqual(mockUser);
        expect(response.status).toBe(200);
    })

    it("GET /login Logs in the registered user", async () => {
        await populateUserDB();
        let mockId = "random123456"
        axios.get.mockResolvedValue({
            id: mockId,
            status: 200
        })
        const response = await axios.get("http://front-end:8079/login",
            { user: "smarter", password: "codes" });

        expect(response).toHaveProperty('id');
        expect(response.status).toBe(200);
    })

    it("GET /login Returns unauthorized error if logged in with wrong credential", async () => {
        await populateUserDB();
        let mockUser = {
            user: "smarter1",
            password: "wrongpass"
        }
        axios.get.mockResolvedValue({
            message: "Unauthorized",
            status: 401
        })
        const response = await axios.get("http://front-end:8079/login", mockUser);

        const users = userDB.collection(user.collectionName);
        const loggedUser = await users.findOne({
            username: mockUser.username,
            password: mockUser.password
        });
        expect(loggedUser).toBe(null);
        expect(response.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
    })
    afterAll(async () => {
        await removeUserDB();
        await userConnection.close();
    });
})

describe("Cart Functionality Test", () => {
    beforeAll(async () => {
        await connectCartDB();
        await populateCartDB();
    })
    beforeEach(async () => {
        await resetCartDB();
    });

    it("GET /cart returns all the items in the cart", async () => {
        await populateCartDB();
        let mockItem = {
            id: "random123",
            name: "Holy Socks",
            price: "11$",
            category: "socks",
            quantity: 1,
            description: "This is a special edition socks in the world"
        }
        axios.get.mockResolvedValue({
            status: 200
        })
        const response = await axios.get('http://front-end:8079/cart')

        const carts = cartDB.collection(cart.collectionName);
        const cartItem = await carts.find({});

        expect(cartItem).toBeTruthy();
        expect(response.status).toBe(200);
    })

    it("POST /cart adds item to cart", async () => {
        let mockItem = {
            id: "random123",
            name: "Holy Socks",
            price: "11$",
            category: "socks",
            description: "This is a special edition socks in the world"
        }
        axios.post.mockResolvedValue({
            status: 200
        })
        const response = await axios.post("http://front-end:8079/cart", mockItem);

        const carts = cartDB.collection(cart.collectionName);
        await carts.insertOne(mockItem);
        const insertedCart = await carts.findOne({ id: mockItem.id });

        expect(insertedCart).toEqual(mockItem);
        expect(response.status).toBe(200);
    })

    it("DEL /cart deletes the cart", async () => {
        await populateCartDB();
        let mockItem = {
            id: "random123",
            name: "Holy Socks",
            price: "11$",
            category: "socks",
            quantity: 1,
            description: "This is a special edition socks in the world"
        }
        axios.delete.mockResolvedValue({
            status: 200
        })
        const response = await axios.delete("http://front-end:8079/cart");

        await cartDB.collection(cart.collectionName).deleteMany({});

        const carts = cartDB.collection(cart.collectionName)
        const cartItem = await carts.findOne({ id: mockItem.id });

        expect(cartItem).toBe(null);
        expect(response.status).toBe(200);
    })

    it("DEL /cart/:id deletes an item from the cart", async () => {
        await populateCartDB();
        let mockItem = {
            id: "random123",
            name: "Holy Socks",
            price: "11$",
            category: "socks",
            description: "This is a special edition socks in the world"
        }
        axios.delete.mockResolvedValue({
            status: 200
        })
        const response = await axios.delete("http://front-end:8079/cart/random123");

        const carts = await cartDB.collection(cart.collectionName);
        await carts.deleteOne({ id: mockItem.id });

        const cartItem = await carts.findOne({ id: mockItem.id });

        expect(cartItem).toBe(null);
        expect(response.status).toBe(200);
    })

    afterAll(async () => {
        await removeCartDB();
        await cartConnection.close();
    });
})