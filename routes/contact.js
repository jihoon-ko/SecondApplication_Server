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

router.get('/show/:uniqueId/custom/', function(req, res){
	var uid = req.params.uniqueId;
	Contact.find({userId: uid}, function(err, contacts){
		return res.json(contacts);
	});
});
router.post('/add/:uniqueId/custom/', function(req, res){
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
router.post('/update/:uniqueId/custom/:contactId/', function(req, res){
	Contact.findById(req.params.contactId, function(err, result){
		if(err) return res.status(500).json({error: "database fail"});
		if(!result) return res.status(404).json({error: "cannot find"});
		result.name = req.body.name
		result.phone = req.body.phone
		result.email = req.body.email
		result.pictureEnc = req.body.picEnc
		result.save(function(err, contact){
			if(err) return res.status(500).json({error: 'failed to update'});
			return res.json({id: contact._id});
		})
	});
});
router.post('/delete/:uniqueId/custom/', function(req, res){
	Contact.remove({userId: req.params.uniqueId,_id: req.body.contactId}, function(err, result){
		if(err) return res.status(500).json({error: "database fail"});
		return res.json({"ok":"1"});
	});
});
module.exports = router;
