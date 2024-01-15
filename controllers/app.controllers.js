const {fetchTopics} = require('../models/app.models.js')

exports.getTopics = 
(request, response, next)=>{
    fetchTopics().then((topics)=>{
        response.status(200).send({topics});
    })
}