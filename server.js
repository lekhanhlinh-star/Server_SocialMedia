const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

console.log(DB);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connections successful');
  })
  .catch((err) => {
    console.log('ERR: ', err);
  });

const port = 5000;
const server = app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
