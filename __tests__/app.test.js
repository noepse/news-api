const request = require('supertest');
const app = require('../app.js');
const testData = require('../db/data/test-data/index.js')
const seed = require('../db/seeds/seed.js')
const endpoints = require('../endpoints.json')

beforeAll(()=>{
    return seed(testData);
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

describe('GET /api/articles', ()=>{
    test('200: responds with an array of articles', ()=>{
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body})=>{
            expect(Array.isArray(body.articles)).toBe(true);
            expect(body.articles.length > 0).toBe(true);
            expect(body.articles).toBeSortedBy('created_at', {descending: true});
            body.articles.forEach((article)=>{
                expect(typeof article.title).toBe('string')
                expect(typeof article.article_id).toBe('number')
                expect(typeof article.topic).toBe('string')
                expect(typeof article.created_at).toBe('string')
                expect(typeof article.votes).toBe('number')
                expect(typeof article.article_img_url).toBe('string')
                expect(typeof article.comment_count).toBe('number')
                expect(article).not.toHaveProperty('body')
            })
        })
    })
})

describe('GET /api/articles/:article_id', ()=>{
    test('200: responds with an article object with relevant properties', ()=>{

        const expectedOutput = {
            article_id: 5,
            title: 'UNCOVERED: catspiracy to bring down democracy',
            topic: 'cats',
            author: 'rogersop',
            body: 'Bastet walks amongst us, and the cats are taking arms!',
            created_at: '2020-08-03T13:14:00.000Z',
            votes: 0,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
          }

        return request(app)
        .get('/api/articles/5')
        .expect(200)
        .then(({body})=>{
            expect(body.article).toMatchObject(expectedOutput);
            expect(body.article.article_id).toBe(5);
        });
    });
    test('400: responds with invalid id if invalid id entered', ()=>{
        return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid id'})
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
});

describe('GET /api/articles/:article_id/comments', ()=>{
    test('200: responds with an array of comments for a given article id', ()=>{
        const expectedOutput = [ 
          {
            comment_id: 15,
            body: "I am 100% sure that we're not completely sure.",
            votes: 1,
            author: "butter_bridge",
            article_id: 5,
            created_at: "2020-11-24T00:08:00.000Z",
          },
          {
            comment_id: 14,
            body: "What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.",
            votes: 16,
            author: "icellusedkars",
            article_id: 5,
            created_at: "2020-06-09T05:00:00.000Z",
          }]
        return request(app)
        .get('/api/articles/5/comments')
        .expect(200)
        .then(({body})=>{
            expect(Array.isArray(body.comments)).toBe(true);
            expect(body.comments).toBeSortedBy('created_at', {descending: true})
            expect(body.comments).toMatchObject(expectedOutput);
            expect(body.comments.length).toBe(2);
            expect(body.comments[0].article_id).toBe(5)
            expect(body.comments[1].article_id).toBe(5)
        })
    });
    test('200: responds with an empty array if a valid article id with no comments is entered', ()=>{
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body})=>{
            expect(Array.isArray(body.comments)).toBe(true);
            expect(body.comments.length).toBe(0);
        })
    })
    test('400: responds with invalid id if invalid article id entered', ()=>{
        return request(app)
        .get('/api/articles/notanid/comments')
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid id'})
        })
    })
    test('404: responds with article not found if valid but non-existent article id entered', ()=>{
        return request(app)
        .get('/api/articles/9999/comments')
        .expect(404)
        .then(({body})=>{
            expect(body).toEqual({msg: 'article not found'})
        })
    });
})


describe('POST /api/articles/:article_id/comments', ()=>{
    test('201: inserts a new comment into the db and responds with the posted comment', ()=>{
        const input = {
            username: 'butter_bridge',
            body: 'this is a comment'
        }
        return request(app)
        .post('/api/articles/5/comments')
        .send(input)
        .expect(201)
        .then(({body})=>{
            expect(body.comment).toEqual('this is a comment')
        })
    });
    test('400: responds with incomplete input if input lacks necessary values', ()=>{
        const input = {
            body: 'this is a comment'
        }
        return request(app)
        .post('/api/articles/5/comments')
        .send(input)
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'incomplete input'})
        })
    })
    // not sure if necessary
    test('400: responds with invalid input if input contains invalid data types', ()=>{
        const input = {
            username: 234,
            body: 134
        }
        return request(app)
        .post('/api/articles/5/comments')
        .send(input)
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid input'})
        })
    });
    test('400: responds with invalid id if invalid article id entered', ()=>{
        const input = {
            username: 'butter_bridge',
            body: 'this is a comment'
        }
        return request(app)
        .post('/api/articles/notanid/comments')
        .send(input)
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid id'})
        })
    });
    test('400: responds with invalid username if username not present on database is entered', ()=>{
        const input = {
            username: 'butter',
            body: 'this is a comment'
        }
        return request(app)
        .post('/api/articles/5/comments')
        .send(input)
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'username not found'})
        })
    });
    test('404: responds with article not found if valid but non-existent article id entered', ()=>{
        const input = {
            username: 'butter_bridge',
            body: 'this is a comment'
        }
        return request(app)
        .post('/api/articles/9999/comments')
        .send(input)
        .expect(404)
        .then(({body})=>{
            expect(body).toEqual({msg: 'article not found'})
        })
    });
})
