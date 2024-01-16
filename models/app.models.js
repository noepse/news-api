const db = require('../db/connection.js')

const fs = require('fs/promises')


exports.fetchTopics = ()=>{
    return db.query('SELECT * FROM topics;')
    .then((result)=>{
        return result.rows;
    })
};

exports.fetchEndpoints = ()=>{
    return fs.readFile('./endpoints.json', 'utf-8').then((result)=>{
        return JSON.parse(result)
    })
}

exports.fetchArticleById = (article_id) => {
    return db.query('SELECT*FROM articles WHERE article_id = $1', [article_id]).then((result)=>{
        if (result.rows.length === 0){
            return Promise.reject({ status: 404, msg: 'article not found' })
        }
        else return result.rows[0]
    });
}