var db = require('../config/connection');
var collection=require('../config/collection');
var bcrypt=require('bcrypt');
const { response } = require('express');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
doLogin:(adminData)=>{
    console.log(adminData);
    return new Promise(async(resolve, reject) => {
        let loginStatus=false;
        let response={}
        let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({
            Email:adminData.Email})
           let Status=null
            console.log(admin);
            if(admin){
                    if(adminData.Password==admin.Password){
                        console.log('login success');
                        response.admin=admin;
                        response.Status=true;
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({Status:false})
                    }

                
            }
            else{
                console.log('user not fund');
                resolve({Status:false})
            }
        
    })
},
getUserOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(orders)
    })
},
getOrders:(userId)=>{
   console.log(userId);
   return new Promise(async(resolve, reject) => {
       
       let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
           {
               $match:{_id:new ObjectId(userId)}
           
           },
           {
               $unwind:'$products'
           },
           {
               $project:{
                   item:'$products.item',
                   quantity:'$products.quantity',
                

               }
           },
           {
               $lookup:{
                   from:collection.PRODUCT_COLLECTION,
                   localField:'item',
                   foreignField:'_id',
                   as:'products'
               }
           },{
               $project:{
                   item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                

               }

           }
           
       ]).toArray()
       resolve(orders)
       console.log(orders);
   })
}

}
