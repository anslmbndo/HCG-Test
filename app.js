const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');
const couchdbIterator = require('couchdb-iterator');

const couch = new NodeCouchDb({
	auth: {
		user:'admin',
		password: '12345'
	}
});

const dbName = 'users_tbl';
const dbbooks = 'books_tbl';
const dbcheckout = 'checkouttbl';
const viewUrl = '_design/users/_view/all';
const viewBooks = '_design/books/_view/all';
const viewCheckout= '_design/checkout/_view/all';

couch.listDatabases().then(function(dbs){
	console.log(dbs);
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){ 
	couch.get(dbName, viewUrl).then(
		function(data, headers, status){
			console.log(data.data.rows);
			res.render('index',{users:data.data.rows});
		},
		function(err){
			res.send(err);
		}
	);
	
});

app.post('/users/add', function(req, res){
	const userid = req.body.userid;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const username = req.body.username;
	const email = req.body.email;
	const phone = req.body.phone;
	const admin = req.body.admin;
	
	couch.uniqid().then(function(ids){
		const id = ids[0];
		
		couch.insert(dbName,{
			_id: id,
			userid: userid,
			firstname: firstname,
			lastname: lastname,
			username: username,
			email: email,
			phone: phone,
			admin: admin
		}).then(
			function(data, headers, status){
				res.redirect('/');
			},
			function(err){
				res.send(err);
			}
		);
	});
});

app.post('/users/delete/:id', function(req, res){
	const id = req.params.id;
	const rev = req.body.rev;
	
	couch.del(dbName, id, rev).then(
		function(data, headers, status){
				res.redirect('/');
			},
			function(err){
				res.send(err);
			}
	);
});

app.post('/users/update/:id', function(req, res){
	const id = req.params.id;
	const rev = req.body.rev;
	const userID = req.body.userId;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const username = req.body.username;
	const email = req.body.email;
	const phone = req.body.phone;
	const admin = req.body.admin;

	
	couch.update(dbName,{
		_id: id,
		_rev: rev,
		userid: userID,
		firstname: firstname,
		lastname: lastname,
		username: username,
		email: email,
		phone: phone,
		admin: admin
	}).then(
		function(data, headers, status){
			res.redirect('/');
		},
		function(err){
			res.send(err);
		}
	);
});


app.get('/books', function(req, res){
	couch.get(dbbooks, viewBooks).then(
		function(data, headers, status){
			console.log(data.data.rows);
			res.render('books',{books:data.data.rows});
		},
		function(err){
			res.send(err);
		}
	);
});



app.post('/books/add', function(req, res){
	const bookId = req.body.bookId;
	const name = req.body.name;
	const category = req.body.category;
	const author = req.body.author;
	const publishDate = req.body.publishDate;
	
	couch.uniqid().then(function(ids){
		const id = ids[0];
		
		couch.insert(dbbooks,{
			_id: id,
			bookId: bookId,
			name: name,
			category: category,
			author: author,
			publishDate: publishDate
		}).then(
			function(data, headers, status){
				res.redirect('/books');
			},
			function(err){
				res.send(err);
			}
		);
	});
});

app.post('/books/delete/:id', function(req, res){
	const id = req.params.id;
	const rev = req.body.rev;
	
	couch.del(dbbooks, id, rev).then(
		function(data, headers, status){
				res.redirect('/books');
			},
			function(err){
				res.send(err);
			}
	);
});

app.post('/books/update/:id', function(req, res){
	const id = req.params.id;
	const rev = req.body.rev;
	const bookId = req.body.bookId;
	const name = req.body.name;
	const category = req.body.category;
	const author = req.body.author;
	const publishDate = req.body.publishDate;
	
	couch.update(dbbooks,{
		_id: id,
		_rev: rev,
		bookId: bookId,
		name: name,
		category: category,
		author: author,
		publishDate: publishDate
	}).then(
		function(data, headers, status){
			res.redirect('/books');
		},
		function(err){
			res.send(err);
		}
	);
});

app.get('/login', function(req, res){
	res.render('login');
});

app.get('/login/redirect', function(req, res){ 
	couch.get(dbName, viewUrl).then(
		function(data, headers, status){
			
			const username = req.body.username;
			couchdbIterator(dbName, viewUrl, (row, index) => {
				console.log(index, row.id, row.key, row.value);
					if(username == row.value.username){
						res.render('/');
					}
					else{
						res.render('/login');
					}
				
				}).then((rowsCount) => {
					console.log(`Iteration completed! ${rowsCount}`);
				}, (err) => {
					console.log('Iteration failed', err);
				});
			},
		function(err){
			res.send(err);
		}
	);
	
});

app.listen(3001, function(){
	console.log('Server started on Port 3001');
});

