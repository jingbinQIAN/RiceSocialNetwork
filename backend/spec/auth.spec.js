const request = require('supertest');
const serverURL = 'https://ricesocialnetwork-419270012db0.herokuapp.com';

describe('Authentication Endpoints', () => {
    let authCookie;

    it('POST /register (should register a new user)', async () => {
        const res = await request(serverURL)
            .post('/register')
            .send({
                username: 'newuser',
                email: 'newuser@example.com',
                dob: '2001-10-22',
                phone: '123-666-9999',
                zipcode: '88290', 
                password: 'newpassword',
            });
        if (res.status == 400){
            expect(res.body.error).toBe('User already exists');
        }
        else{
            expect(res.status).toBe(200);
            expect(res.body.result).toBe('success');
        }     
    });

    it('POST /login (should log in a user)', async () => {
        const res = await request(serverURL)
            .post('/login')
            .send({
                username: 'joey',
                password: 'pass',
            });
        expect(res.status).toBe(200);
        expect(res.body.result).toBe('success');
    });

    it('PUT /logout (should log out a user)', async () => {
        // login the user first so that it can loggout
        const loginres = await request(serverURL)
            .post('/login')
            .send({
                username: 'joey',
                password: 'pass',
            });
        expect(loginres.status).toBe(200);
        expect(loginres.body.result).toBe('success');

        // Extract the session cookie from the login response
        const cookies = loginres.headers['set-cookie'];
        const logoutres = await request(serverURL)
            .put('/logout')
            .set('Cookie', cookies) // Send the session cookie with the logout request
        expect(logoutres.status).toBe(200);
        expect(logoutres.body.result).toBe('OK');

        // test if the user has't login
        const logoutres2 = await request(serverURL)
            .put('/logout')
            .set('Cookie', cookies) // Send the session cookie with the logout request
        expect(logoutres2.status).toBe(401);
        expect(logoutres2.body.error).toBe('Unauthorized. Please Log In First.');
    });
});
