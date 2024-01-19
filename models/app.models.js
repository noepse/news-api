const db = require("../db/connection.js");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query("SELECT*FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      } else {
        return this.fetchCommentsByArticleId(article_id).then((comments) => {
          result.rows[0].comment_count = comments.length;
          return result.rows[0];
        });
      }
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1", [article_id])
    .then((result) => {
      return result.rows;
    });
};

exports.fetchArticles = async (
  topic,
  sort_by = "created_at",
  order_by = "desc"
) => {
  const queryValues = [];

  let queryStr = "SELECT*FROM articles";

  if (topic) {
    await this.checkTopicExists(topic);
    queryValues.push(topic);
    queryStr += ` WHERE topic=$1`;
  }

  const validSortBy = [
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "article_img_url",
  ];

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid sort query" });
  }

  const validOrderBy = ["asc", "desc"];

  if (!validOrderBy.includes(order_by)) {
    return Promise.reject({ status: 400, msg: "invalid order query" });
  }

  queryStr += ` ORDER BY ${sort_by} ${order_by}`;

  return db.query(queryStr, queryValues).then((result) => {
    const promises = [];
    const articles = result.rows;
    articles.forEach((article) => {
      promises.push(
        this.countCommentsByArticleId(article.article_id).then(({ count }) => {
          article.comment_count = Number(count);
          delete article.body;
        })
      );
    });
    return Promise.all(promises).then(() => {
      return articles;
    });
  });
};

exports.checkTopicExists = (topic) => {
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [topic])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      }
    });
};

exports.countCommentsByArticleId = (article_id) => {
  return db
    .query("SELECT COUNT(comment_id) FROM comments WHERE article_id = $1", [
      article_id,
    ])
    .then((result) => {
      return result.rows[0];
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return this.checkArticleExists(article_id).then(() => {
    return db
      .query(
        "SELECT * FROM comments WHERE article_id = $1 ORDER by created_at DESC",
        [article_id]
      )
      .then((result) => {
        return result.rows;
      });
  });
};

exports.checkArticleExists = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
    });
};

exports.submitCommentOnArticle = (article_id, username, body) => {
  const values = [body, username, article_id];

  if (values.includes(undefined)) {
    return Promise.reject({ status: 400, msg: "incomplete input" });
  }

  if (
    typeof body !== "string" ||
    typeof Number(article_id) !== "number" ||
    typeof username !== "string"
  ) {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }

  return this.checkArticleExists(article_id).then(() => {
    return this.checkAuthorExists(username).then(() => {
      return db
        .query(
          "INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING*",
          values
        )
        .then((result) => {
          return result.rows[0].body;
        });
    });
  });
};

exports.checkAuthorExists = (username) => {
  return db
    .query("SELECT name FROM users WHERE username = $1", [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 400, msg: "invalid username" });
      }
    });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: "missing votes value" });
  }

  if (typeof inc_votes !== "number" || inc_votes === NaN) {
    return Promise.reject({ status: 400, msg: "invalid votes value" });
  }

  return this.fetchVotesOnArticle(article_id).then((votes) => {
    const updatedVotes = votes + inc_votes;
    return this.updateArticleById(article_id, updatedVotes).then(() => {
      return this.fetchArticleById(article_id);
    });
  });
};

exports.fetchVotesOnArticle = (article_id) => {
  return this.fetchArticleById(article_id).then((result) => {
    return result.votes;
  });
};

exports.updateArticleById = (article_id, value) => {
  return db.query("UPDATE articles SET votes =  $1 WHERE article_id = $2", [
    value,
    article_id,
  ]);
};

exports.removeCommentById = (comment_id) => {
  return this.checkCommentExists(comment_id).then(() => {
    return db.query("DELETE FROM comments WHERE comment_id = $1", [comment_id]);
  });
};

exports.checkCommentExists = (comment_id) => {
  return db
    .query("SELECT body FROM comments WHERE comment_id = $1", [comment_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      }
    });
};

exports.fetchUsers = () => {
  return db.query("SELECT*FROM users").then((result) => {
    return result.rows;
  });
};

exports.fetchUserByUsername = (username) => {
  return db
    .query("SELECT username, name, avatar_url FROM users WHERE username = $1", [
      username,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "user not found" });
      }
      return result.rows[0];
    });
};

exports.updateCommentVotes = (comment_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: "missing votes value" });
  }

  if (typeof inc_votes !== "number" || inc_votes === NaN) {
    return Promise.reject({ status: 400, msg: "invalid votes value" });
  }

  return this.fetchVotesOnComment(comment_id).then((votes) => {
    const updatedVotes = votes + inc_votes;
    return this.updateCommentById(comment_id, updatedVotes).then(() => {
      return this.fetchCommentById(comment_id);
    });
  });
};

exports.fetchVotesOnComment = (comment_id) => {
  return this.fetchCommentById(comment_id).then((result) => {
    return result.votes;
  });
};

exports.fetchCommentById = (comment_id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [comment_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      }
      return result.rows[0];
    });
};

exports.updateCommentById = (comment_id, value) => {
  return db.query("UPDATE comments SET votes =  $1 WHERE comment_id = $2", [
    value,
    comment_id,
  ]);
};

exports.submitArticle = (author, title, body, topic, article_img_url) => {

  const requiredValues = [author, title, body, topic];

  if (requiredValues.includes(undefined)) {
    return Promise.reject({ status: 400, msg: "incomplete input" });
  }

  if (typeof author !== 'string' || typeof title !== 'string' || typeof body !== 'string' || typeof topic !== 'string'){
      return Promise.reject({status: 400, msg: 'invalid input'})
  }

  return this.checkAuthorExists(author).then(() => {
    return this.checkTopicExists(topic).then(()=>{
        let img_url_str = ''
        let img_url_column = ''
        if (article_img_url){
            requiredValues.push(article_img_url);
            img_url_column = ', article_img_url' 
            img_url_str = ', $5'
          }

        return db
      .query(
        `INSERT INTO articles (author, title, body, topic${img_url_column}) VALUES ($1, $2, $3, $4${img_url_str}) RETURNING*`,
        requiredValues
      )
      .then((result) => {
        console.log(result)
        const article_id = result.rows[0].article_id
        return this.fetchArticleById(article_id)
      })
    })
  });
};
