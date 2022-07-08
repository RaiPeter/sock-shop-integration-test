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
    userInfo: {
        username: "smarter",
    },
}
const cart = {
    host: 'cart-db',
    port: 27017,
    databaseName: 'test-db',
    collectionName: 'test-cart',
    url: `mongodb://cart-db:27017/`,
    cartInfo: {
        _id: "cart123",
        customerID: "userID",
        items: [
            {
                _id: "random123",
                name: "Holy Socks",
                price: "11$",
                category: "socks",
                quantity: 1,
                description: "This is a special edition socks in the world"
            }
        ]
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

describe("Cart Functionality Test", () => {
    beforeAll(async () => {
        await connectUserDB();
        await connectCartDB();
    })
    beforeEach(async () => {
        await resetCartDB();
        await resetUserDB();
    });

    it("GET /cart returns all the items in the cart", async () => {
        const mockID = "mockUserID"
        let mockUser = {
            _id: mockID,
            username: "smarter"
        }
        let mockCart = {
            _id: "cart123",
            customerID: mockID,
            items: [
                {
                    _id: "random123",
                    name: "Holy Socks",
                    price: "11$",
                    category: "socks",
                    quantity: 1,
                    description: "This is a special edition socks in the world"
                }
            ]
        }
        axios.get.mockResolvedValue({
            status: 200,
            body: mockCart.items
        })
        const response = await axios.get('http://front-end:8079/cart')

        const users = userDB.collection(user.collectionName);

        // inserting a mock user in user DB,
        const insertedUser = await users.insertOne(mockUser);
        console.log("User inserted");

        const carts = cartDB.collection(cart.collectionName);
        // inserting a mock cart along with user's _id as customerID to make sure user exists
        const insertedCart = await carts.insertOne(mockCart);

        // checking if the user already present in cart DB,
        // if it does, it returns all the items in that user's cart
        const foundCart = await carts.findOne({ customerID: mockID });

        expect(foundCart.items).toEqual(mockCart.items);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCart.items);
    })

    it("DEL /cart deletes the cart for the particular user", async () => {
        const mockID = "mockUserID"
        let mockUser = {
            _id: mockID,
            username: "smarter"
        }
        let mockCart = {
            _id: "cart123",
            customerID: mockID,
            items: [
                {
                    _id: "random123",
                    name: "Holy Socks",
                    price: "11$",
                    category: "socks",
                    quantity: 1,
                    description: "This is a special edition socks in the world"
                }
            ]
        }
        axios.delete.mockResolvedValue({
            status: 200
        })
        const response = await axios.delete('http://front-end:8079/cart')

        const users = userDB.collection(user.collectionName);

        // inserting a mock user in user DB,
        const insertedUser = await users.insertOne(mockUser);
        console.log("User inserted");

        const carts = cartDB.collection(cart.collectionName);
        // inserting a mock cart along with user's _id as customerID to make sure user exists
        const insertedCart = await carts.insertOne(mockCart);

        await carts.deleteOne({ _id: mockCart._id });

        const foundCart = await carts.findOne(insertedCart._id);

        expect(foundCart).toBe(null);
        expect(response.status).toBe(200);
    })

    it("DEL cart/:id deletes an item from the cart", async () => {
        let mockUser = {
            _id: "mockUserID",
            username: "smarter"
        }
        let mockCart = {
            _id: "cart123",
            customerID: "mockUserID",
            items: [
                {
                    _id: "random123",
                    name: "Holy Socks",
                    price: "11$",
                    category: "socks",
                    quantity: 1,
                    description: "This is a special edition socks in the world"
                }
            ]
        }
        axios.delete.mockResolvedValue({
            status: 200
        })
        const response = await axios.delete('http://front-end:8079/cart')

        const users = userDB.collection(user.collectionName);

        // inserting a mock user in user DB,
        const insertedUser = await users.insertOne(mockUser);
        console.log("User inserted");

        const carts = cartDB.collection(cart.collectionName);
        // inserting a mock cart along with user's _id as customerID to make sure user exists
        const insertedCart = await carts.insertOne({
            _id: "cart123",
            customerID: insertedUser._id,
            items: [
                {
                    _id: "random123",
                    name: "Holy Socks",
                    price: "11$",
                    category: "socks",
                    quantity: 1,
                    description: "This is a special edition socks in the world"
                }
            ]
        });

        await carts.deleteOne({ "items._id": mockCart.items._id });

        const foundCart = await carts.findOne({ 'items._id': mockCart.items._id })

        expect(foundCart).toBe(null);
        expect(response.status).toBe(200)
    })

    it("POST /cart adds items to cart", async () => {
        let mockUser = {
            _id: "mockUserID",
            username: "smarter"
        }
        let mockCart = {
            _id: "cart123",
            customerID: "mockUserID",
            items: [
                {
                    _id: "random123",
                    name: "Holy Socks",
                    price: "11$",
                    category: "socks",
                    quantity: 1,
                    description: "This is a special edition socks in the world"
                }
            ]
        }
        axios.post.mockResolvedValue({
            status: 200
        })
        const response = await axios.post('http://front-end:8079/cart', {
            id: "random123",
            price: "11$"
        })

        const users = userDB.collection(user.collectionName);
        const instertedUser = users.insertOne(mockUser);

        const carts = cartDB.collection(cart.collectionName);
        const insertedCart = await carts.insertOne({
            _id: "cart123",
            customerID: "mockUserID",
            items: []
        })
        const updatedCart = await carts.update({
            _id: "cart123"
        }, {
            $push: {
                "items": {
                    _id: "random123",
                    name: "Holy Socks",
                    price: "11$",
                    category: "socks",
                    quantity: 1,
                    description: "This is a special edition socks in the world"
                }
            }
        })
        const foundCart = await carts.findOne({ _id: "cart123" });

        expect(foundCart).toEqual(mockCart);
        expect(response.status).toBe(200);
    })

    afterAll(async () => {
        await removeCartDB();
        await removeUserDB();
        await cartConnection.close();
        await userConnection.close();
    });
})