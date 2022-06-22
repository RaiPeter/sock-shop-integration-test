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
                username: "smarter1",
                firstName: "codes1",
                lastName: "smarter1",
                email: "smarter@codes1.com",
                password: "smarter1"
            });
        expect(response.status).toBe(200);
    })
    it("GET /login Logs in the registered user", async () => {
        const response = await request("http://front-end:8079")
            .get('/login')
            .auth('smarter', 'smarter')
        expect(response.status).toBe(200);

    })
    it("GET /login Returns unauthorized error if logged in with wrong credential", async () => {
        const response = await request("http://front-end:8079")
            .get('/login')
            .auth('smarter', 'smarterasdf')
        expect(response.status).toBe(401);
    })
})