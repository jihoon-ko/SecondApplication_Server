var express = require('express');
var router = express.Router();
var sha1 = require('js-sha1');

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
	console.log("Connected to mongod server!");
});

mongoose.connect('mongodb://localhost/voice');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	uid : String,
	attempt : Number,
	success : Number,
	rating : Number
});

var problemSchema = new Schema({
	word : String,
	attempt : Number,
	success : Number
});

var resultSchema = new Schema({
	expected : String,
	result : String,
	count : Number
});

var User = mongoose.model('user', userSchema);
var Problem = mongoose.model('problem', problemSchema);
var Result = mongoose.model('result', resultSchema);



router.get('/user/:uid/', function(req, res){
	var uuid = req.params.uid;
	User.findOne({uid : uuid}, function(err, user){
		if(err) return res.status(500).json({error : err});
		if(!user){
			var new_user = new User();
			new_user.uid = uuid;
			new_user.attempt = 0;
			new_user.success = 0;
			new_user.save(function (err){
				if(err){
					return res.status(500).json({error : err});
				}
				return res.json(new_user);
			});
		}else{
			return res.json(user);
		}
	});
});

router.get('/problem/:word/', function(req, res){
	word = req.params.word;
	Problem.findOne({word: word}, function (err, problem){
		if(err) return res.status(500).send({error : err});
		if(!problem) return res.status(404).send({error: "word not found"});
		return res.json(problem);
	});
});

router.get('/problem/', function(req, res){
	Problem.find(function (err, problems){
		if(err) return res.status(500).send({error : 'database failure'});
		else{
			var len = problems.length;
			var index = Math.floor(Math.random() * len);
			res.json(problems[index]);
		}
	});
});


router.get('/result/:expected/', function(req, res){
	var exp = req.params.expected;
	Result.find({expected : exp}).sort('-count').limit(3).exec(function(err, results){
		if(err) return res.status(500).json({error : err});
		else return res.json(results);
	});
});

router.post('/problem/add/', function(req, res){
	var new_word = req.body.word;
	Problem.findOne({word: new_word}, function(err, user){
		if(err) return res.status(500).json({error: err});
		if(!user){
			var new_problem = new Problem();
			new_problem.word = new_word;
			new_problem.attempt = 0;
			new_problem.success = 0;
			new_problem.save(function(err){
				if(err){
					return res.status(500).json({error: err});
				}else{
					return res.json({ok: 1});
				}
			});
		}else{
			return res.json({ok: 0, error: "already exists"});
		}
	});
});

router.post('/result/update/', function(req, res){
	var uid = req.body.uid;
	var expected = req.body.expected;
	var result = req.body.result;
	var ok = 0;
	if(expected.toLowerCase() == result.toLowerCase()){
		ok = 1;
	}else{
		ok = 0;
	}
	User.findOne({uid: uid}, function(err, user){
		if(err) return res.status(500).json({error: err});
		if(!user) return res.status(404).json({error: 'user not found'});
		user.attempt += 1
		user.success += ok;
		user.save(function(err){
			if(err){
				return res.status(500).json({error: err});
			}
		});
	});
	Problem.findOne({word: expected}, function(err, prob){
		if(err) return res.status(500).json({error: err});
		if(!prob) return res.status(404).json({error: 'user not found'});
		prob.attempt += 1
		prob.success += ok;
		prob.save(function(err){
			if(err){
				return res.status(500).json({error: err});
			}
		});
	});
	Result.findOne({expected: expected, result: result}, function(err, resultt){
		if(err) return res.status(500).json({error: err});
		if(!resultt){
			var new_result = new Result();
			new_result.expected = expected;
			new_result.result = result;
			new_result.count = 1;
			new_result.save(function(err){
				if(err){
					return res.status(500).json({error: err});
				}
			});
		}else{
			resultt.count += 1;
			resultt.save(function(err){
				if(err){
					return res.status(500).json({error: err});
				}
			});
		}
	});
	return res.json({ok: ok});
});

module.exports = router;
