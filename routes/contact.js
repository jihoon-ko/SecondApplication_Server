var express = require('express');
var router = express.Router();
var sha1 = require('js-sha1');

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
  console.log("Connected to mongod server!");
});

mongoose.connect('mongodb://localhost/jihoon_testdb');

var Schema = mongoose.Schema;
var contactSchema = new Schema({
  userId: String, // Facebook User ID
  place: String, // (Facebook | Contact | Custom)
  name: String, // name
  phone: String, // phone
  email: String, // email
  pictureUrl: String, 
  pictureEnc: String
  //uid: {type: mongoose.SchemaTypes.ObjectId, required: true}
});

var Contact = mongoose.model('contact', contactSchema);

router.get('/clear', function(req, res, next) {

});

router.get('/all', function(req, res, next){
  res.send('get all information!');
});

router.post('/add/fb', function(req, res){
  var new_contact = new Contact({});
  var new_uid = sha1(req.query.id).substring(0, 24);
  new_contact.place = "facebook";
  new_contact.iid = req.query.id;
  new_contact.name = req.query.name;
  new_contact.pictureUrl = req.query.url;
  new_contact.picture = undefined;
  //console.log(req);
  if(!(req.query.id) || !(req.query.name) || !(req.query.url)){
    return res.json({result:0});
  }
  console.log(mongoose.Types.ObjectId.isValid(new_uid));
  new_contact._id = new_uid;
  Contact.findById({place: "facebook", _id: new_uid}, function(err, contact){
    if(err) return res.json({result:0, error: err});
    if(!contact){
      new_contact.save(function(err){
        if(err){
          console.error(err);
          return res.json({result:0, error: err});
        }else{
          return res.json({result:1});
        }
      });
    }else{
      contact.name = req.query.name;
      contact.pictureUrl = req.query.url;
      contact.save(function(err){
        if(err){
          console.error(err);
          return res.json({result:0, error:err});
        }else{
          return res.json({result:1});
        }
      });
    }
  });
});

router.post('/add/dv', function(req, res){
  res.send("test");
});

var uniqueId = "";
router.post('/add/:uniqueId/custom', function(req, res){
	var new_contact = new Contact({
		userId: req.params.uniqueId,
		place: "custom",
		name: req.body.name,
		phone: req.body.phone,
		email: req.body.email,
		pictureUrl: "", 
		pictureEnc: req.body.picEnc
	});
	new_contact.save(function(err, contact){
		if(err) return console.error(err);
		console.dir(contact);
		return res.json({"id":contact._id});
	});
});

module.exports = router;
