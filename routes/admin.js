var express = require('express');
const log = require('handlebars');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var adminHelpers = require('../helpers/admin-Helpers')

const varifylogin=(req,res,next)=>{
  // console.log(req.session.admin.loggedIn)
  
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}



/* GET users listing. */
router.get('/', function(req, res, next) {
  let ad=req.session.admin
  console.log(req.session.admin)
  productHelpers.getAllProducts().then((prodects)=>{
    console.log(prodects);
    res.render('admin/view-products',{admin:true,prodects,ad})

  })

});
router.get('/admin-login',(req,res)=>{
  
  if(req.session.admin){
    res.redirect('/')
  }else{
    
    res.render('./admin/admin-login',{admin:true,"loginErr":req.session.adminLoginErr});
    req.session.adminLoginErr=false;

  }
  
})
router.post('/admin-login',(req,res)=>{
  console.log(req.body);
  adminHelpers.doLogin(req.body).then((response)=>{

  if(response.Status){   
    console.log(response.Status); 
    req.session.admin=response.admin
    req.session.adminLoggedIn=true
    res.redirect('/admin')
  }else{
    req.session.adminLoginErr=true
    res.redirect('/admin/admin-login')
  }
})
})
 router.get('/admin-logout',(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=false
   res.redirect('/admin')

})





router.get('/add-product',varifylogin,function(req,res){
  res.render('admin/add-product',{admin:true,ad:req.session.admin})
})
router.post('/add-product',(req,res)=>{
 

     productHelpers.addProduct(req.body,(id)=>{
      let image=req.files.Image
     
      
      image.mv('./public/product-image/'+id+'.jpg',(err)=>{
      if(!err){

        res.render('admin/add-product' ,{admin:true})
      }else{
        console.log(err);
      }
    })
    
  })

 })
 router.get('/delete-product/:id',varifylogin,(req,res)=>{
  let proID=req.params.id
  console.log(proID);
  productHelpers.deleteProduct(proID).then((response)=>{
    res.redirect('/admin/',{ad:req.session.admin})
  })

  
 })
 router.get('/edit-product/:id',varifylogin,async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:true,product,ad:req.session.admin})
 })
 router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateproduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-image/'+id+'.jpg')


    }else{
      
    }
  })

 })
 router.get('/allOrders',varifylogin,async(req,res)=>{
  let orders = await adminHelpers.getUserOrders()
  console.log(orders);
  res.render("admin/allOrders",{ad:req.session.admin, orders})
})
router.get('/order-product/:id',varifylogin,async(req,res)=>{
  // console.log(req.session.user._id);
  let orders= await adminHelpers.getOrders(req.params.id)
  res.render('./admin/order-product',{ad:req.session.admin,orders})
})





module.exports = router;

