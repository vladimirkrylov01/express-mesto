const express = require('express');
const mongoose = require('mongoose');

const {PORT = 3000} = process.env;
const app = express();

app.use((req, res, next) => {
	req.user = {
		_id: '61dbee80fe940074b070133d',
	};

	next();
});

const rootRouter = require('./routes');

app.use(express.json());
app.use('/', rootRouter);

mongoose.connect('mongodb://localhost:27017/mestodb', {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

app.listen(PORT ,() => {
	console.log(`Сервер запущен - http://localhost:${PORT}`)
});
