var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers');
const varifylogin=(req,res,next)=>{
  console.log(req.session.userLoggedIn)
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user;
  console.log(user);
  let cartcount=null;
  if(req.session.user){
  cartcount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((prodects)=>{
    
    res.render('./user/view-products',{admin:false,prodects,user,cartcount})

  })
});
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    
    res.render('./user/login',{"loginErr":req.session.userLoginErr});
    req.session.userLoginErr=false;

  }
  
})
router.get('/signup',(req,res)=>{
  res.render('./user/signup');
})
router.post('/signup',(req,res)=>{
 userHelpers.doSignup(req.body).then((response))
 console.log(response);
  req.session.user=response
  req.session.user.loggedIn=true
 res.redirect('/')


})
router.post('/login',(req,res)=>{
  //  console.log(req.body);
  userHelpers.doLogin(req.body).then((response)=>{
   
  if(response.Status){    
    req.session.user=response.user
    req.session.userLoggedIn=true
    res.redirect('/')
  }else{
    req.session.userLoginErr=true
    res.redirect('/login')
  }
})
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  
  res.redirect('/')

})
router.get('/cart',varifylogin,async(req,res)=>{
  let user=req.session.user;
  let product=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0;
  if(product.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)

  }
 
  // console.log(product);
  res.render('./user/cart',{product,user,totalValue})


})

router.get('/add-to-cart/:id',(req,res)=>{
  // console.log("api calling");
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({Status: true});

  })

})
router.post('/change-product-Quantity',(req,res,next)=>{
  userHelpers.ChangeProductQuantity(req.body).then(async(response)=>{
    let product=await userHelpers.getCartProducts(req.session.user._id)
    if(product.length>0){
      response.total=await userHelpers.getTotalAmount(req.body.user)
  
    }
   
    res.json(response);

  })
})
router.post('/remove-product',(req,res)=>{
  userHelpers.removeProduct(req.body).then((response)=>{
    res.json(response);

  })

})
router.get('/Place-Order',varifylogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('./user/Place-Order',{total,user:req.session.user});
})
router.post('/place-order',async(req,res)=>{
  console.log(req.body.userId);
  let prodects=await userHelpers.getCartProductsList(req.body.userId)
  let totalprice= await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,prodects,totalprice).then((response)=>{
    res.json({Status:true})

  })
  console.log(req.body);
})
router.get('/success',(req,res)=>{
  res.render('./user/success',{user:req.session.user})
})
router.get('/my-order',varifylogin,async(req,res)=>{
  console.log(req.session.user._id);
  let orders= await userHelpers.getUseOrders(req.session.user._id)
  res.render('./user/my-order',{user:req.session.user,orders})
})
router.get('/products-details/:id',async(req,res)=>{
  console.log(req.params.id);
  
  let details=await userHelpers.getOrdersDetails(req.params.id)
  res.render('./user/products-details',{user:req.session.user,details})
})
router.get('/details/:id',varifylogin,async(req,res)=>{

 let product=await productHelpers.getDetails(req.params.id)
 console.log(product);

  res.render('./user/details',{product});
})
router.post('/search',varifylogin,async(req,res)=>{
  console.log(req.body);
  let product=await productHelpers.getSearchDetails(req.body)
   console.log(product);
   if(product.length > 0){
    console.log(product);
    res.render('./user/search',{product});

   }else{
    res.render('./user/searchnot');

   }
   
  })
 



module.exports = router;
