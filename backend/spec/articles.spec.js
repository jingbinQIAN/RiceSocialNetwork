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

describe('Articles Endpoints', () => {
    it('POST /article (should add a new article for the logged-in user, text the length increased by 1 and its content)', async () => {
        if (!authCookie) fail('Login failed; cannot add article.');

        // Get the current number of articles before posting the new one
        const initialRes = await request(serverURL)
            .get('/articles')
            .set('Cookie', authCookie);
        const initialArticleCount = initialRes.body.articles.length;

        //Add a new article
        const res = await request(serverURL)
            .post('/article')
            .set('Cookie', authCookie)
            .send({ text: 'This is a test article.' });
        
        expect(res.status).toBe(200);
        // Check if the list of articles has increased by one
        expect(res.body.articles.length).toBe(initialArticleCount + 1);
        // Verify the new article's content
        const newArticle = res.body.articles[initialArticleCount];
        expect(newArticle.text).toBe('This is a test article.');
        expect(newArticle.author).toBe('joey');  // Assuming 'joey' is the logged-in user
        expect(newArticle.date).toBeDefined();   // Ensure a date is present
    });

    it('GET /articles (should return articles for the logged-in user)', async () => {
        if (!authCookie) fail('Login failed; cannot fetch articles.');
        const res = await request(serverURL)
            .get('/articles')
            .set('Cookie', authCookie);
        expect(res.status).toBe(200);
        // Check that all articles' author is the logged-in user
        res.body.articles.forEach(article => {
            expect(article.author).toBe('joey');
        });
    });

    it('GET /articles/:id (should return an article by valid ID and error by invalid ID)', async () => {
        if (!authCookie) fail('Login failed; cannot fetch article by ID.');
        // Check Valid ID.
        // First, we post a specific article, then we can search this specific article's ID
        const articleRes = await request(serverURL)
            .post('/article')
            .set('Cookie', authCookie)
            .send({ text: 'Article for ID test' });
        expect(articleRes.status).toBe(200);
        // get the id of the article we post first.
        const articleId = articleRes.body.articles[0].id;
        const res = await request(serverURL)
            .get(`/articles/${articleId}`)
            .set('Cookie', authCookie);
        expect(res.status).toBe(200);
        expect(res.body.articles[0].id).toBe(articleId);

        // Check Invalid ID.
        const res2 = await request(serverURL)
            .get(`/articles/-1`)
            .set('Cookie', authCookie);
        expect(res2.status).toBe(404);
        expect(res2.body.error).toBe('Article not found');
    });
});
