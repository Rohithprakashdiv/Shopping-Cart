const mongoClient=require('mongodb').MongoClient;
const state={
    db:null
}
module.exports.connect=async function(done){
    const url='mongodb://127.0.0.1:27017/'
    const dbname='shopping'
    try{
        const data =await mongoClient.connect(url)
        state.db=data.db(dbname);
        done()

    }catch(err){
        done(err)


    }


}
module.exports.get=function(){
    return state.db
}