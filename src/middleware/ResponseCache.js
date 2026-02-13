const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 0, checkperiod: 1 });

module.exports = duration =>(req,res,next)=>{
    if(req.method!='GET'){
        console.error('Cache NoT Support For non-get requests')
        return next()
    }
    const key = req.originalUrl;
    const cachedResponse = cache.get(key)
    console.log(req.originalUrl)
    if(cachedResponse){
        console.log(`Cache hit for ${key}`)
        res.send(cachedResponse)
    }else{
        console.log(`Cache Miss for ${key}`)
        res.originalSend = res.send
        res.send = body =>{
            res.originalSend(body);
            cache.set(key, body)
        }
        next()
    }
}
module.exports.deleteCache = duration =>(req,res,next)=>{
    if(req.method=='GET'){
        console.error('Cache Delete NoT Support For get requests')
        return next()
    }
    const key = req.originalUrl;
    cache.flushAll()
    next()
}