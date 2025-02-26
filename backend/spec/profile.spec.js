const request = require('supertest');
const serverURL = 'https://ricesocialnetwork-419270012db0.herokuapp.com';

let authCookie;

beforeAll(async () => {
    const res = await request(serverURL)
        .post('/login')
        .send({
            username: 'joey',
            password: 'pass',
        });
    expect(res.status).toBe(200);
    authCookie = res.headers['set-cookie'];
});

describe('Profile Endpoints', () => {
    it('GET /headline (should return the headline for the logged-in user)', async () => {
        if (!authCookie) fail('Login failed; cannot fetch headline.');
        const res = await request(serverURL)
            .get('/headline')
            .set('Cookie', authCookie);
        // Check whether it return the headline correctly. 
        expect(res.status).toBe(200);
        expect(res.body.headline).toBeDefined();
    });

    it('PUT /headline (should update the headline for the logged-in user)', async () => {
        if (!authCookie) fail('Login failed; cannot update headline.');
        const res = await request(serverURL)
            .put('/headline')
            .set('Cookie', authCookie)
            .send({ headline: 'Updated headline' });
        expect(res.status).toBe(200);
        expect(res.body.headline).toBe('Updated headline');
    });
});
