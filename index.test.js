const request = require('supertest')
jest.setTimeout(60000);

describe("User Authentication Test", () => {
    it("GET / Hits the home page /", async () => {
        const response = await request("http://front-end:8079")
            .get("/")
        expect(response.status).toBe(200);
    })
    it("POST /register Registers a new user", async () => {
        const response = await request("http://front-end:8079")
            .post('/register')
            .send({
                username: "smarter5",
                firstName: "codes5",
                lastName: "smarter5",
                email: "smarter@codes5.com",
                password: "smarter5"
            });
        expect(response.status).toBe(200);
    })
    it("GET /login Logs in the registered user", async () => {
        const response = await request("http://front-end:8079")
            .get('/login')
            .auth('user', 'password')
        expect(response.status).toBe(200);

    })
    it("GET /login Returns unauthorized error if logged in with wrong credential", async () => {
        const response = await request("http://front-end:8079")
            .get('/login')
            .auth('user', 'wrongpassword')
        expect(response.status).toBe(401);
    })
})
