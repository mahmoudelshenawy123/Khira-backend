const mongoose = require('mongoose')

mongoose
  .connect(process.env.CONNECTION_STRING, { dbName: process.env.DB_NAME })
  .then((res) => {
    console.log('db conncted successfully')
  })
  .catch((err) => {
    console.log(err)
  })
