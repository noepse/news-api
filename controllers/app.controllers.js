const { request } = require('../app.js');
const {fetchTopics, fetchEndpoints} = require('../models/app.models.js')

exports.getTopics = 
(request, response, next)=>{
    fetchTopics().then((topics)=>{
        response.status(200).send({topics});
    })
}

exports.getEndpoints = (request, response, next) => {
    fetchEndpoints().then((endpoints)=>{
        response.status(200).send({endpoints});
    })
}