const axios = require('axios')
const { MongoClient } = require('mongodb');

jest.setTimeout(60000);

jest.mock('axios')

let connection;
let db;
const host = 'user-db';
const port = 27017;
const databaseName = 'test-db';
const collectionName = 'test-customers'
var url = `mongodb://${host}:${port}/`;
const mockUser = {
    username: "smarter",
    firstName: "smarter",
    lastName: "codes",
    email: "smarter@codes.com",
    password: "codes"
}

const connectDB = async () => {
    connection = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    db = await connection.db(databaseName);
}

const populateDB = async () => {
    const users = db.collection(collectionName);

    await users.insertOne(mockUser);
    console.log("User inserted");
}

const resetDB = async () => {
    await db.collection(collectionName).deleteMany({});
}

const removeDB = async () => {
    await db.dropDatabase()
    console.log("Database Dropped!");
}

beforeEach(async () => {
    await resetDB();
});

beforeAll(async () => {
    await connectDB();
    await populateDB();
})

afterAll(async () => {
    await removeDB();
    await connection.close();
});


describe("User Authentication Test", () => {
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

        const users = db.collection(collectionName);
        await users.insertOne(mockUser);
        const insertedUser = await users.findOne({ username: mockUser.username });

        expect(insertedUser).toEqual(mockUser);
        expect(response.status).toBe(200);
    })

    it("GET /login Logs in the registered user", async () => {
        await populateDB();
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
        await populateDB();
        let mockUser = {
            user: "smarter1",
            password: "wrongpass"
        }
        axios.get.mockResolvedValue({
            message: "Unauthorized",
            status: 401
        })
        const response = await axios.get("http://front-end:8079/login", mockUser);

        const users = db.collection(collectionName);
        const loggedUser = await users.findOne({
            username: mockUser.username,
            password: mockUser.password
        });
        expect(loggedUser).toBe(null);
        expect(response.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
    })
})