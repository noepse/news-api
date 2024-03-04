const request = require("supertest");
const app = require("../app.js");
const db = require('../db/connection.js');
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
    db.end()
});

describe("GET /api", () => {
  test("200: responds with object containing relevant keys for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body.endpoints).toBe("object");
        expect(endpoints).toMatchObject(body.endpoints);
        expect(body.endpoints.length).not.toBe(0)

        for (const key in body.endpoints) {
          expect(typeof body.endpoints[key].description).toBe("string");
          expect(Array.isArray(body.endpoints[key].queries)).toBe(true);
          expect(typeof body.endpoints[key].exampleResponse).toBe("object");
        }
      });
  });
  test("404: reponds with endpoint not found when unknown path entered", () => {
    return request(app)
      .get("/api/unknownpath")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("endpoint not found");
      });
  });
});

describe("GET /api/topics", () => {
    test("200: responds with an array of topic objects with relevant keys", () => {
        return request(app)
          .get("/api/topics")
          .expect(200)
          .then((data) => {
            const topicsData = data.body.topics;
            expect(Array.isArray(topicsData)).toBe(true);
            expect(topicsData.length > 0).toBe(true);
            topicsData.forEach((topic) => {
              expect(typeof topic.slug).toBe("string");
              expect(typeof topic.description).toBe("string");
            });
          });
      });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(13);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
        body.articles.forEach((article) => {
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(article).not.toHaveProperty("body");
        });
      });
  });
});

describe('"GET /api/articles/?topic', ()=>{
    test('200: responds with an array of articles under specified topic value', ()=>{
        return request(app)
        .get('/api/articles/?topic=cats')
        .expect(200)
        .then(({body})=>{
            const articlesData = body.articles
            expect(Array.isArray(articlesData)).toBe(true)
            expect(articlesData.length).not.toBe(0)
            articlesData.forEach((article)=>{
                expect(article.topic).toEqual('cats');
            });
        })
    });
    test('200: responds with an empty array if a valid topic that has no corresponding articles is entered', ()=>{
        return request(app)
        .get('/api/articles/?topic=paper')
        .expect(200)
        .then(({body})=>{
            const articlesData = body.articles
            expect(Array.isArray(articlesData)).toBe(true)
            expect(articlesData.length).toBe(0)
        })
    })
    test('404: responds with topic not found if an invalid topic is entered', ()=>{
        return request(app)
        .get('/api/articles/?topic=notatopic')
        .expect(404)
        .then(({body})=>{
            expect(body).toEqual({msg: 'topic not found'})
        })
    })
})

describe('GET /api/articles/?sort_by', ()=>{
    test('200: responds with an array of articles sorted by specified query - descending by default', ()=>{
        return request(app)
        .get('/api/articles/?sort_by=title')
        .expect(200)
        .then(({body})=>{
            expect(Array.isArray(body.articles)).toBe(true);
            expect(body.articles.length).toBe(13);
            expect(body.articles).toBeSortedBy("title", { descending: true });
            body.articles.forEach((article) => {
                expect(typeof article.title).toBe("string");
                expect(typeof article.article_id).toBe("number");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(typeof article.votes).toBe("number");
                expect(typeof article.article_img_url).toBe("string");
                expect(typeof article.comment_count).toBe("number");
                expect(article).not.toHaveProperty("body");
              });
        })
    });
    test('400: responds with invalid sort query if invalid sort query entered', ()=>{
        return request(app)
        .get('/api/articles/?sort_by=notaquery')
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid sort query'});
        })
    })
})

describe('GET /api/articles/?order_by', ()=>{
    test('200: responds with an array of articles sorted by specified order - created_at by default', ()=>{
        return request(app)
        .get('/api/articles/?order_by=asc')
        .expect(200)
        .then(({body})=>{
            expect(Array.isArray(body.articles)).toBe(true);
            expect(body.articles.length).toBe(13);
            expect(body.articles).toBeSortedBy("created_at", { descending: false });
            body.articles.forEach((article) => {
                expect(typeof article.title).toBe("string");
                expect(typeof article.article_id).toBe("number");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(typeof article.votes).toBe("number");
                expect(typeof article.article_img_url).toBe("string");
                expect(typeof article.comment_count).toBe("number");
                expect(article).not.toHaveProperty("body");
              });
        })
    });
    test('400: responds with invalid order query if invalid order query entered', ()=>{
        return request(app)
        .get('/api/articles/?order_by=notaquery')
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid order query'});
        })
    })
})

describe("GET /api/articles/:article_id", () => {
  test("200: responds with an article object with relevant properties", () => {
    const expectedOutput = {
      article_id: 5,
      title: "UNCOVERED: catspiracy to bring down democracy",
      topic: "cats",
      author: "rogersop",
      body: "Bastet walks amongst us, and the cats are taking arms!",
      created_at: "2020-08-03T13:14:00.000Z",
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .get("/api/articles/5")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject(expectedOutput);
        expect(body.article.article_id).toBe(5);
        expect(body.article.comment_count).toBe(2)
      });
  });
  test("400: responds with invalid id if invalid id entered", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid id" });
      });
  });
  test("404: responds with article not found if valid but non-existent id entered", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "article not found" });
      });
  });
});

describe("POST /api/articles", () => {
    test("201: inserts a new article into the db and responds with the posted article", () => {
      const input = {
        author: "rogersop",
        title: "test title",
        body: "a very non descriptive test body",
        topic: "cats",
        article_img_url: "testurl.jpg",
      };

      const expectedOutput = {
        article_id: 14,
        author: "rogersop",
        title: "test title",
        body: "a very non descriptive test body",
        topic: "cats",
        article_img_url: "testurl.jpg",
        votes: 0,
        comment_count: 0,
      };
      return request(app)
        .post("/api/articles")
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject(expectedOutput);
          expect(typeof body.article.created_at).toBe('string')
          expect(body.article.article_id).toEqual(14)
        });
    });
    test("201: inserts a new article into the db with a default article image url if not entered", () => {
        const input = {
          author: "rogersop",
          title: "test title",
          body: "a very non descriptive test body",
          topic: "cats",
        };
  
        const expectedOutput = {
          article_id: 14,
          author: "rogersop",
          title: "test title",
          body: "a very non descriptive test body",
          topic: "cats",
          article_img_url: "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          votes: 0,
          comment_count: 0,
        };
        return request(app)
          .post("/api/articles")
          .send(input)
          .expect(201)
          .then(({ body }) => {
            expect(body.article).toMatchObject(expectedOutput);
            expect(typeof body.article.created_at).toBe('string')
            expect(body.article.article_id).toEqual(14)
            expect(body.article.article_img_url).toBe('https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700')
          });
      });
    test("400: responds with incomplete input if input lacks necessary values", () => {
      const input = {
        author: "rogersop",
        body: "a very non descriptive test body",
        topic: "cats",
        article_img_url: "testurl.jpg",
      };
      return request(app)
        .post("/api/articles")
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "incomplete input" });
        });
    });
    // not sure if necessary
    test("400: responds with invalid input if input contains invalid data types", () => {
      const input = {
        author: "rogersop",
        title: 314541,
        body: "a very non descriptive test body",
        topic: "cats",
        article_img_url: "testurl.jpg",
      };
      return request(app)
        .post("/api/articles")
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "invalid input" });
        });
    });
    test("400: responds with invalid username if invalid author given", () => {
      const input = {
        author: "roger",
        title: "test title",
        body: "a very non descriptive test body",
        topic: "cats",
        article_img_url: "testurl.jpg",
      };
      return request(app)
        .post("/api/articles")
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "invalid username" });
        });
    });
    test("404: responds with topic not found if valid but non existent topic given", () => {
      const input = {
        author: "rogersop",
        title: "test title",
        body: "a very non descriptive test body",
        topic: "invalidtopic",
        article_img_url: "testurl.jpg",
      };
      return request(app)
        .post("/api/articles")
        .send(input)
        .expect(404)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "topic not found" });
        });
    });
  });

describe("PATCH /api/articles/:article_id", () => {
  test("200: responds with the requested article object with an updated votes property", () => {
    const input = { inc_votes: 1 };
    const expectedOutput = {
      article_id: 5,
      title: "UNCOVERED: catspiracy to bring down democracy",
      topic: "cats",
      author: "rogersop",
      body: "Bastet walks amongst us, and the cats are taking arms!",
      votes: 1,
      created_at: "2020-08-03T13:14:00.000Z",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .patch("/api/articles/5")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toEqual(5)
        expect(body.article.votes).toEqual(1)
        expect(body.article).toMatchObject(expectedOutput);
      });
  });
  test('400: responds with missing votes value if incomplete body sent', ()=>{
    const input = {};

    return request(app)
    .patch('/api/articles/5')
    .send(input)
    .expect(400)
    .then(({body})=>{
        expect(body).toEqual({msg: 'missing votes value'})
    })
  })
  test('400: responds with invalid votes value if invalid data type entered', ()=>{
    const input = {inc_votes: 'three'};

    return request(app)
    .patch('/api/articles/5')
    .send(input)
    .expect(400)
    .then(({body})=>{
        expect(body).toEqual({msg: 'invalid votes value'})
    })
  })
  test('400: responds with invalid id if invalid article id entered', ()=>{
    const input = {inc_votes: 1};

    return request(app)
    .patch('/api/articles/banana')
    .send(input)
    .expect(400)
    .then(({body})=>{
        expect(body).toEqual({msg: 'invalid id'})
    })
  })
  test('404: responds with article not found if valid but non existent article id entered', ()=>{
    const input = {inc_votes: 1};

    return request(app)
    .patch('/api/articles/9999')
    .send(input)
    .expect(404)
    .then(({body})=>{
        expect(body).toEqual({msg: 'article not found'})
    })
  })
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments for a given article id", () => {
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
      },
    ];
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
        expect(body.comments).toMatchObject(expectedOutput);
        expect(body.comments.length).toBe(2);
        expect(body.comments[0].article_id).toBe(5);
        expect(body.comments[1].article_id).toBe(5);
      });
  });
  test("200: responds with an empty array if a valid article id with no comments is entered", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(0);
      });
  });
  test("400: responds with invalid id if invalid article id entered", () => {
    return request(app)
      .get("/api/articles/notanid/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid id" });
      });
  });
  test("404: responds with article not found if valid but non-existent article id entered", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "article not found" });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: inserts a new comment into the db and responds with the posted comment", () => {
    const input = {
      username: "butter_bridge",
      body: "this is a comment",
    };

    return request(app)
      .post("/api/articles/5/comments")
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toHaveProperty('comment_id', 19);
        expect(body.comment).toHaveProperty('article_id', 5);
        expect(body.comment).toHaveProperty('author', 'butter_bridge');
        expect(body.comment).toHaveProperty('body', 'this is a comment');
        expect(body.comment).toHaveProperty('votes', 0);
        expect(body.comment).toHaveProperty('created_at');
      });
  });
  test("400: responds with incomplete input if input lacks necessary values", () => {
    const input = {
      body: "this is a comment",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "incomplete input" });
      });
  });
  // not sure if necessary
  test("400: responds with invalid input if input contains invalid data types", () => {
    const input = {
      username: 234,
      body: 134,
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid input" });
      });
  });
  test("400: responds with invalid id if invalid article id entered", () => {
    const input = {
      username: "butter_bridge",
      body: "this is a comment",
    };
    return request(app)
      .post("/api/articles/notanid/comments")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid id" });
      });
  });
  test("400: responds with invalid username if username not present on database is entered", () => {
    const input = {
      username: "butter",
      body: "this is a comment",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "invalid username" });
      });
  });
  test("404: responds with article not found if valid but non-existent article id entered", () => {
    const input = {
      username: "butter_bridge",
      body: "this is a comment",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "article not found" });
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
    test("200: responds with the requested comment object with an updated votes property", () => {
      const input = { inc_votes: 1 };
      const expectedOutput = {
        comment_id: 18,
        body: "This morning, I showered for nine minutes.",
        votes: 17,
        author: "butter_bridge",
        article_id: 1,
        created_at: "2020-07-21T00:20:00.000Z",
      }

      return request(app)
        .patch("/api/comments/18")
        .send(input)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment.comment_id).toEqual(18)
          expect(body.comment.votes).toEqual(17)
          expect(body.comment).toMatchObject(expectedOutput);
        });
    });
    test('400: responds with missing votes value if incomplete body sent', ()=>{
      const input = {};
  
      return request(app)
      .patch('/api/comments/18')
      .send(input)
      .expect(400)
      .then(({body})=>{
          expect(body).toEqual({msg: 'missing votes value'})
      })
    })
    test('400: responds with invalid votes value if invalid data type entered', ()=>{
      const input = {inc_votes: 'three'};
  
      return request(app)
      .patch('/api/comments/18')
      .send(input)
      .expect(400)
      .then(({body})=>{
          expect(body).toEqual({msg: 'invalid votes value'})
      })
    })
    test('400: responds with invalid id if invalid comment id entered', ()=>{
      const input = {inc_votes: 1};
  
      return request(app)
      .patch('/api/comments/eighteen')
      .send(input)
      .expect(400)
      .then(({body})=>{
          expect(body).toEqual({msg: 'invalid id'})
      })
    })
    test('404: responds with comment not found if valid but non existent comment id entered', ()=>{
      const input = {inc_votes: 1};
  
      return request(app)
      .patch('/api/comments/9999')
      .send(input)
      .expect(404)
      .then(({body})=>{
          expect(body).toEqual({msg: 'comment not found'})
      })
    })
  });

describe("DELETE /api/comments/:comment_id", ()=>{
    test('204: deletes the specified comment and returns no content', ()=>{
        return request(app)
        .delete('/api/comments/5')
        .expect(204)
        // 204 status code responds with no body no matter what, so no .then is necessary
    });
    test('400: responds with invalid id if invalid comment id entered', ()=>{
        return request(app)
        .delete('/api/comments/banana')
        .expect(400)
        .then(({body})=>{
            expect(body).toEqual({msg: 'invalid id'})
        })
    })
    test('404: responds with comment not found if valid but non existent comment id entered', ()=>{
        return request(app)
        .delete('/api/comments/9999')
        .expect(404)
        .then(({body})=>{
            expect(body).toEqual({msg: 'comment not found'})
        })
    })
})

describe('GET /api/users', ()=>{
    test('200: responds with an array of user objects with relevant properties', ()=>{
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body})=>{
            const usersData = body.users
            expect(Array.isArray(usersData)).toBe(true);
            expect(usersData.length).toBe(4)

            usersData.forEach((user) => {
              expect(typeof user.username).toBe("string");
              expect(typeof user.name).toBe("string");
              expect(typeof user.avatar_url).toBe("string");
            })
        })
    });
})

describe("GET /api/users/:username", () => {
    test("200: responds with the specified user object with relevant properties", () => {
      const expectedOutput = {
        username: 'rogersop',
    name: 'paul',
    avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4',
      };
  
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toMatchObject(expectedOutput);
          expect(body.user.username).toBe('rogersop');
          expect(body.user.name).toBe('paul')
          expect(body.user.avatar_url).toBe('https://avatars2.githubusercontent.com/u/24394918?s=400&v=4')
        });
    });
    test("404: responds with user not found if valid but non-existent username entered", () => {
      return request(app)
        .get("/api/users/notauser")
        .expect(404)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "user not found" });
        });
    });
  });