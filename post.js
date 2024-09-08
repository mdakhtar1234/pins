
/**yah post ke liye schema banaya gaya hai jo post ke liye kay sab lagega */
const mongoose = require('mongoose');

const postSchema = mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  title: String,
  decsription: String,
  image : String
});


module.exports = mongoose.model("post",postSchema);