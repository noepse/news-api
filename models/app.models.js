const db = require('../db/connection.js')

exports.fetchTopics = ()=>{
    return db.query('SELECT * FROM topics;')
    .then((result)=>{
        return result.rows;
    })
};

exports.fetchArticleById = (article_id) => {
    return db.query('SELECT*FROM articles WHERE article_id = $1', [article_id]).then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({ status: 404, msg: 'article not found' })
        }
        else return result.rows[0]
    });
}

exports.fetchArticles = () => {
    return db.query('SELECT*FROM articles ORDER BY created_at DESC')
    .then((result)=>{
        const promises = []
        const articles = result.rows
        articles.forEach((article)=>{
            promises.push(this.countCommentsByArticleId(article.article_id)
            .then(({count})=>{
                article.comment_count = Number(count);
                delete article.body
            })) 
        });
        return Promise.all(promises).then(()=>{
            return articles
        })
    });
}

exports.countCommentsByArticleId = (article_id) =>{
    return db.query('SELECT COUNT(comment_id) FROM comments WHERE article_id = $1', [article_id])
    .then((result)=>{
        return result.rows[0];
    })
}

exports.fetchCommentsByArticleId = (article_id) =>{
    return this.checkArticleExists(article_id)
    .then(()=>{
        return db.query('SELECT * FROM comments WHERE article_id = $1 ORDER by created_at DESC', [article_id])
        .then((result)=>{
            return result.rows;
        })
    })
}

exports.checkArticleExists = (article_id)=>{
    return db.query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({ status: 404, msg: 'article not found' })
        }
    })
}

exports.submitCommentOnArticle = (article_id, username, body)=>{

    const values = [body, username, article_id]

    if (values.includes(undefined) ){
        return Promise.reject({status: 400, msg: 'incomplete input'})
    }

    if (typeof body !== 'string' || typeof Number(article_id) !== 'number' || typeof username !== 'string'){
        return Promise.reject({status: 400, msg: 'invalid input'})
    }

    return this.checkArticleExists(article_id)
    .then(()=>{
        return this.checkAuthorExists(username)
        .then(()=>{
            return db.query('INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING*', values)
            .then((result)=>{
                return result.rows[0].body
            })
        })
    })
}

exports.checkAuthorExists = (username)=>{
    return db.query('SELECT name FROM users WHERE username = $1', [username]).then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({ status: 400, msg: 'username not found' })
        }
    })
}

exports.updateArticleVotes = (article_id, inc_votes) =>{

    if (inc_votes === undefined ){
        return Promise.reject({status: 400, msg: 'missing votes value'})
    }

    if (typeof inc_votes !== 'number' || inc_votes === NaN){
        return Promise.reject({status: 400, msg: 'invalid votes value'})
    }

    return this.fetchArticleById(article_id).then((article)=>{
        article.votes += inc_votes
        return article;
    })
}

exports.removeCommentById = (comment_id)=>{
    return this.checkCommentExists(comment_id)
        .then(()=>{
            return db.query('DELETE FROM comments WHERE comment_id = $1',[comment_id])
        });
}

exports.checkCommentExists = (comment_id)=>{
    return db.query('SELECT body FROM comments WHERE comment_id = $1', [comment_id]).then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({ status: 404, msg: 'comment not found' })
        }
    })
}