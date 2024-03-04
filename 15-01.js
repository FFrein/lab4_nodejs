const expressHandlebars = require('express-handlebars');
const express = require('express');
const path = require('path');
const fs = require('fs');
const qs = require('qs');

const handlebars = expressHandlebars.create({
	defaultLayout: 'main', 
	extname: 'hbs',
	helpers: {
		exit: `document.location='/page/main'`
	}
});

let app = express();

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

const publicPath = path.join(__dirname, 'views', 'public');
app.use(express.static(publicPath));

//маршруты
app.get('/page/Update', async function(req, res) {
	fs.readFile('DataBase.json', 'utf8', (err, users) => {
		if (err) {console.error(err);return;}
		let data = JSON.parse(users);
		let usr = data.find((elem)=>elem.id == req.query.id)
		res.render("update.hbs", {
			users:data,
			user:usr, 
			clickable:true
		});
	});
});
app.get('/page/add', async function(req, res) {
	fs.readFile('DataBase.json', 'utf8', (err, users) => {
		if (err) {console.error(err);return;}
		res.render("add", {users:JSON.parse(users), clickable:true});
	});
});
app.post('/page/add', async function(req, res) {
	let data = '';
	let filePath = 'DataBase.json';
	req.on('data', (chunk)=>{
		data += chunk;
	});
	req.on('end', ()=>{
		let DB;

		let name = qs.parse(data)['name'];
		let number = qs.parse(data)['number'];		
		let newUser = {"id" : -1, "name":`${name}`, "number":`${number}`}

		//чтение json
		try {
			DB = fs.readFileSync(filePath, 'utf8');
			DB = JSON.parse(DB);
			newUser.id = DB[DB.length - 1].id + 1;
			DB[DB.length] = newUser;
			DB = JSON.stringify(DB, null, 2);// Второй аргумент - количество пробелов для отступов
		} catch (error) {
			console.error('Error reading file:', error.message);
		}

		//запись в json
		fs.writeFile(filePath, DB, 'utf8', (err) => {
			if (err) {
				console.error('Error writing to file:', err.message);
			} else {
				console.log('Data has been written to the file successfully.');
			}
		});

	})
	res.writeHead(302, {
		'Location': '/page/main' // Путь к новой странице
	});
	res.end();
});
app.post('/page/update', async function(req, res) {
	let data = '';
	let filePath = 'DataBase.json';
	req.on('data', (chunk)=>{
		data += chunk;
	});
	req.on('end', ()=>{
		let DB;

		let name = qs.parse(data)['name'];
		let number = qs.parse(data)['number'];		
		let id = qs.parse(data)['id'];	
		let newUser = {"id" : id, "name":`${name}`, "number":`${number}`}

		//чтение json
		try {
			DB = fs.readFileSync(filePath, 'utf8');
			DB = JSON.parse(DB);
			//обновление пользователя
			for(let i = 0; i < DB.length; i++){
				if(newUser.id == DB[i].id){
					DB[i] = newUser;
				}
			}
			DB = JSON.stringify(DB, null, 2);// Второй аргумент - количество пробелов для отступов
		} catch (error) {
			console.error('Error reading file:', error.message);
		}

		//запись в json
		fs.writeFile(filePath, DB, 'utf8', (err) => {
			if (err) {
				console.error('Error writing to file:', err.message);
			} else {
				console.log('Data has been written to the file successfully.');
			}
		});

	})
	res.writeHead(302, {
		'Location': '/page/main' // Путь к новой странице
	});
	res.end();
});
app.delete('/page/delete/:id', async function(req, res) {
	let data = '';
	let filePath = 'DataBase.json';

	req.on('end', ()=>{
		let DB;
		let id = req.params.id;
		let newUser = {"id" : id};

		//чтение json
		try {
			DB = fs.readFileSync(filePath, 'utf8');
			DB = JSON.parse(DB);
			//обновление пользователя
			for(let i = 0; i < DB.length; i++){
				if(Number(newUser.id) === Number(DB[i].id)){
					DB.splice(i, 1);
				}
			}
			DB = JSON.stringify(DB, null, 2);// Второй аргумент - количество пробелов для отступов
		} catch (error) {
			console.error('Error reading file:', error.message);
		}

		//запись в json
		fs.writeFile(filePath, DB, 'utf8', (err) => {
			if (err) {
				console.error('Error writing to file:', err.message);
			} else {
				console.log('Data has been written to the file successfully.');
			}
		});

	})
	res.writeHead(302, {
		'Location': '/page/main' // Путь к новой странице
	});
	res.end();
});
app.get('/page/main', async function(req, res) {
	fs.readFile('DataBase.json', 'utf8', (err, users) => {
		if (err) {console.error(err);return;}
		res.render("main", {users:JSON.parse(users), clickable:false});
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});