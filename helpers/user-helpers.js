var db = require('../config/connection');
var collection=require('../config/collection');
var bcrypt=require('bcrypt');
const { response } = require('express');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    doSignup: (userData) => {
      return new Promise(async(resolve, reject) => {
        userData.Password =await bcrypt.hash(userData.Password, 10);
        console.log(userData.Password )
        db.get()
        .collection(collection.USER_COLLECTIONS)
        .insertOne(userData)
        .then((data) => {
          userData._id=data.insertedId
          console.log(userData);
          resolve(userData);
        });
      
      })
  },
doLogin:(userData)=>{
    console.log(userData);
    return new Promise(async(resolve, reject) => {
        let loginStatus=false;
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTIONS).findOne({
            Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((Status)=>{
                    if(Status){
                        console.log('login success');
                        response.user=user;
                        response.Status=true;
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({Status:false})
                    }

                })
            }
            else{
                console.log('user not fund');
                resolve({Status:false})
            }
        
    })
},

    addToCart:(proId,userId)=>{
        let ProObj={
            item:new ObjectId(proId),
            quantity:1
        }
        return new Promise(async(resolve, reject) => {
            let usercart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
            if(usercart){
                let ProExist=usercart.products.findIndex(product => product.item==proId)
                console.log(ProExist);
                if(ProExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(userId),'products.item':new ObjectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                 db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(userId)},
                 {
                    
                         $push:{products:ProObj}  
                 },
                 {upsert:true}
                 ).then((response)=>{
                     resolve()

                 }) 
                }
                }
         else{
                let cartobj={
                    user:new ObjectId(userId),
                    products:[ProObj]

                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response)=>{
                    resolve()
                })
            }
            
            
        })  
},
getCartProducts:(userId)=>{
    return new Promise(async(resolve, reject) => {
        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:new ObjectId(userId)}
            
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
        console.log(cartItems);
        resolve(cartItems)
        
    })

  },
  getCartCount:(userId)=>{
     return new Promise(async(resolve, reject) => {
        count=0;
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
        if(cart){
            count=cart.products.length
            
            
        }
        resolve(count)
        
     })
  },
  ChangeProductQuantity:(details)=>{
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
     return new Promise((resolve, reject) => {
         if( details.count==-1&& details.quantity==1){
     db.get().collection(collection.CART_COLLECTION).updateOne({_id:new ObjectId(details.cart)},
        {
            $pull:{products:{item:new ObjectId(details.product)}}
        }
         ).then((response)=>{
           
             resolve({removeProduct:true})
         })
     }else{ 
        db.get().collection(collection.CART_COLLECTION) .updateOne({_id:new ObjectId(details.cart),'products.item':new ObjectId(details.product)},
        {
            $inc:{'products.$.quantity':details.count}
        }
        ).then((response)=>{
            
           
            resolve({Status:true})
        })
    
        
    }
        
     })

 },
 removeProduct:(details)=>{
    return new Promise((resolve, reject) => {
        
    db.get().collection(collection.CART_COLLECTION).updateOne({_id:new ObjectId(details.cart)},
       {
           $pull:{products:{item:new ObjectId(details.product)}}
       }
        ).then((response)=>{
          
            resolve({removeProduct:true})
        })
    
})
    

 },
 getTotalAmount:(userId)=>{
    return new Promise(async(resolve, reject) => {
        let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:new ObjectId(userId)}
            
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
                    as:'product'
                }
            },{
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                 

                }

            },{
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}
                }
            }

            
        ]).toArray()
        console.log(total[0].total);
        // console.log(cartItems);
        resolve(total[0].total);
        
    })


 },
 placeOrder:(order,prodects,total)=>{
    return new Promise((resolve, reject) => {
        console.log(order,prodects,total);
        let Status= order['paymentMethod']==='cod'?'placed':'pending'
        let orderObj={
            deliveryDetalis:{
                fname:order.fname,
                sname:order.sname,
                email:order.email,
                mobile:order.mobile,
                address:order.address,
                address2:order.address2,
                pincode:order.pincode

            },
            userId:new ObjectId(order.userId),
            paymentmetMethod:order['paymentMethod'],
            products:prodects,
            totalAmount:total,
            Status:Status,
            date:new Date()
        }
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(order.userId)})
            resolve()
        })
    })

 },
 getCartProductsList:(userId)=>{
   
    return new Promise(async(resolve, reject) => {
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
        console.log(cart);
        resolve(cart.products)

    })

 },
 getUseOrders:(userId)=>{
    console.log(userId);
    return new Promise(async(resolve, reject) => {
        
        let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{userId:new ObjectId(userId)}
            
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
 },
 getOrdersDetails:(userId)=>{
    return new Promise(async(resolve, reject) => {
        let details=await db.get().collection(collection.ORDER_COLLECTION).find({_id:new ObjectId(userId)}).toArray()
        console.log(details);
        resolve(details)
    })
 }



}
  