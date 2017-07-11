
router.get('/user/:uid', function(req, res){
	var uuid = req.params.uuid;
	User.find({uid : uuid}, function(err, users){
		if(err) return res.status(500).hson({error : err});
		if(users.length == 0){
			var user = new User();
			user.uid = req.params.uuid;
			user.attempt = 0;
			user.success = 0;
			user.save(function (err){
				if(err){
					console.error(err);
					res.json({result : 0});
					return;
				}
				res.json({result : 1});
			});
		}
		res.json(users);
	});
});

router.get('/problem', function(req, res){
	Problem.find(function (err, problems)[
		if(err) return res.status(500).send({error : 'database failure'});
		else{
			var len = problems.length;
			var index = Math.floor(Math.random() * len);
			res.json(problems[index]);
		}
	});
});


router.get('/result/:expected', function(req, res){
	var exp = req.params.expected;
	Result.find({expected : exp}, function(err, users){
		if(err) return res.status(500).hson({error : err});
		res.json(users);
	});
});



