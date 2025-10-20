const mongoose=require('mongoose');

const AffilaitepayoutSchema=new mongoose.Schema({
      affilaiteamount:{
        type:Number,
        required:true
      },
      masteraffiliateamount:{
        type:Number,
        required:true
      }
},{timestamps:true});

const Affilaitepayout=mongoose.model('Affilaitepayout',AffilaitepayoutSchema);

module.exports=Affilaitepayout;