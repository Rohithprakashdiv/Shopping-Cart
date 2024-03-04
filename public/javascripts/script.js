
   function addToCart(proId){
      $.ajax({
         url:'/add-to-cart/'+proId,
         method:'get',
         dataType: 'json',
         success:(response)=>{
            if(response.Status){
               let count= $("#cart-count").html()
               count = parseInt(count)+1
               $("#cart-count").html(count)
               // alert(response)
              

            }
        }
        

      })
   }
   
   
  
