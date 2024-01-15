const request = require('supertest');
const app = require('../app.js');
const testData = require('../db/data/test-data/index.js')
const seed = require('../db/seeds/seed.js')

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
            topicsData.forEach((topic)=>{
                expect(typeof topic.slug).toBe('string');
                expect(typeof topic.description).toBe('string')
            })
        })
    })
})