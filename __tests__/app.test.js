const request = require('supertest');
const app = require('../app.js');
const testData = require('../db/data/test-data/index.js')
const seed = require('../db/seeds/seed.js')
const endpoints = require('../endpoints.json')

beforeAll(()=>{
    return seed(testData);
})

describe('GET /api/topics', ()=>{
    test('404: reponds with endpoint not found when unknown path entered', ()=>{
        return request(app)
        .get('/api/unknownpath')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('endpoint not found')
        })
    })
    test('200: responds with an array of topic objects with relevant keys', ()=>{
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((data)=>{
            const topicsData = data.body.topics;
            expect(Array.isArray(topicsData)).toBe(true);
            expect(topicsData.length > 0).toBe(true);
            topicsData.forEach((topic)=>{
                expect(typeof topic.slug).toBe('string');
                expect(typeof topic.description).toBe('string')
            })
        })
    })
})

describe('GET /api', ()=>{
    test('200: responds with object containing relevant keys for each endpoint', ()=>{
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body})=>{
            expect(typeof body.endpoints).toBe('object')
            expect(endpoints).toMatchObject(body.endpoints)
            
            for (const key in body.endpoints){
                expect(typeof body.endpoints[key].description).toBe('string')
                expect(Array.isArray(body.endpoints[key].queries)).toBe(true)
                expect(typeof body.endpoints[key].exampleResponse).toBe('object')
            }
        })  
    })
});

describe('GET /api/articles/:article_id', ()=>{
    test('200: responds with an article object with relevant properties', ()=>{
        return request(app)
        .get('/api/articles/5')
        .expect(200)
        .then(({body})=>{
            expect(typeof body.article).toBe('object')
            expect(typeof body.article.title).toBe('string');
            expect(typeof body.article.topic).toBe('string');
            expect(typeof body.article.created_at).toBe('string');
            expect(typeof body.article.author).toBe('string');
            expect(typeof body.article.body).toBe('string');
            expect(typeof body.article.votes).toBe('number');
            expect(typeof body.article.article_img_url).toBe('string');
        })
    });
    test('400: responds with invalid id if invalid  id entered', ()=>{
        return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid id entered'})
        })
    });
    test('404: responds with article not found if valid but non-existent id entered', ()=>{
        return request(app)
        .get('/api/articles/9999')
        .expect(404)
        .then(({body})=>{
            expect(body).toEqual({msg: 'article not found'})
        })
    });
})