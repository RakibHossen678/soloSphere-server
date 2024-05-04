const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port =process.env.PORT || 9000

//middleWare
app.use(express.json())
const corsOptions={
    origin:['http://localhost:5173','http://localhost:5174'],
    credential:true,
    optionSuccessStatus:200,
}
app.use(cors(corsOptions))



app.get('/', (req, res) => {
  res.send('soloSphere server is running')
})

app.listen(port, () => {
  console.log(`soloSphere is  listening on port ${port}`)
})