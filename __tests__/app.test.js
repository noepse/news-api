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

describe('GET /api', ()=>{
    test('200: responds with object containing relevant keys for each endpoint', ()=>{
        return request(app)
        .get('/api')
        .then(({body})=>{
            expect(typeof body.endpoints).toBe('object')

            for (const key in body.endpoints){
                console.log(key)
                expect(typeof body.endpoints[key].description).toBe('string')
                expect(Array.isArray(body.endpoints[key].queries)).toBe(true)
                expect(typeof body.endpoints[key].exampleResponse).toBe('object')
            }
        })  
    })
})