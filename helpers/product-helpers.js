 var db = require('../config/connection');
 var collection=require('../config/collection');
const  response  = require('express');

const ObjectId = require('mongodb').ObjectId;



 module.exports={
     addProduct:(product,callback)=>{
        
         db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);
             
             callback(data.insertedId);
            //  callback(data.);

         })
     },
     getAllProducts:()=>{
        return new Promise(async(resolve, reject) => {
            let prodects=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(prodects)
        })
     },
     deleteProduct:(prodID)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(prodID)}).then((response)=>{
                 console.log(prodID);

                resolve(response)
            })
        })

     },
     getProductDetails:(proId)=>{
        return  new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new  ObjectId (proId)}).then((product)=>{
                // console.log(proId);
                resolve(product)

            })
        })

      
     },
      updateproduct:(proId,proDetails)=>{
         return new Promise((resolve, reject) => {
            
             db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new ObjectId(proId)},
             
            {
                
                 $set:{
                     Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category

                }
                

             }).then((response)=>{
                 resolve()
             })
         })
      },getDetails:(proId)=>{
        
        return  new Promise((resolve, reject) => {
        let product= db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(proId)})
                // console.log(proId);
                resolve(product)
        

        })
        },

      getSearchDetails:(search)=>{
        console.log(search);
        return  new Promise(async(resolve, reject) => {
          let product= await db.get().collection(collection.PRODUCT_COLLECTION).find({Name:search.Name}).toArray()
                // console.log(proId);
                resolve(product)

            })
       

      
     }



  }