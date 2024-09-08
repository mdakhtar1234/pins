var express = require('express');
var router = express.Router();

const userModel = require("./users");
const postModel = require("./post")
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer')

passport.use(new localStrategy(userModel.authenticate()));

/** this is a / page */
router.get('/', function(req, res, next) {
  res.render('index' ,{nav: false});
});

/**yaha se ham register kar sakte hai  */
router.get('/register', function(req, res, next) {
  res.render("register",{nav:false});
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user =
   await userModel
   .findOne({username: req.session.passport.user})
   .populate("posts")
  res.render("profile",{user , nav:true});
});

/**yaha se ham har post dekh sakte hai */
router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user =
   await userModel
   .findOne({username: req.session.passport.user})
   .populate("posts")
  res.render("show",{user , nav:true});
});


/**yaha se ham user likha huaa description dekh sakte hai */
router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user =
  await userModel.findOne({username: req.session.passport.user})
   const posts = await postModel.find()
   .populate("user")
   res.redirect("feed" , {user , posts , nav:true});
});

/**yaha par ham naya post fille karte hai */
router.get('/add', isLoggedIn, async function(req, res, next) {
  const user =
  await userModel.findOne({username: req.session.passport.user});
  res.render("add",{user , nav:true});
});


/**es main ham post create karte hai aur ham ek image send karte hai and post ke baare main likhte h */
router.post('/createpost', isLoggedIn,upload.single("postimage") ,async function(req, res, next) {
  const user = 
  await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.decription,
    image:req.file.filename

  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});



/**profile mein image upload karne ka code */
router.post('/fileupload', isLoggedIn, upload.single ("image"), async function(req, res, next) {
  //res.send("uploaded");
 const user = await userModel.findOne({username: req.session.passport.user});
 user.profileImage = req.filename;
  await user.save();
  res.redirect("profile");

});

/**register karte time jo bhi data hamko filled karna par hai  woh yah hai  */
router.post('/register', function(req, res, next) {
 const data = new userModel({
  username: req.body.username,
  password: req.body.password,
  email: req.body.email,
  contact: req.body.contact,
  name : req.body.fullname,
 });

 /**aghr user password create kiya hai us password ko local par lejeye aur user ko files par lejaye */
 userModel.register(data, req.body.password)
 .then( function(){
  passport.authenticate("local")(req  , res , function(){
    res.redirect("/profile");
  })
 })
});

/** aghr user wrong username yah password filled hai tuh / page par rakhye user ko */
/**yaadi correct filled kiya to /profile par lejaye user ko */
router.post('/login', passport.authenticate("local", {
  failureRedirect:"/",
  successRedirect:"/profile",
  
}),function (req , res , next) {});

/**this is a statement logout */
router.get("/logout" , function (req , res , next){
  req.logout(function (err){
    if(err){return next(err);}
    res.redirect('/')
  });
});

/**aghar user login hai tab to like post kar skta hai nahi tuh / page par chala jayega user */
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}
module.exports = router;
