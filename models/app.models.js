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