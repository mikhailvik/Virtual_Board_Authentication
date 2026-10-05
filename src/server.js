const cors = require('cors')
const express = require('express')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 8080

console.log(`Node.js ${process.version}`)

app.use(express.json())

// Allow requests from the frontend
app.use(cors())

app.get('/', (req, res) => {
    res.json({ msg: "Virtual Board Authentication API", version: "0.1" })
})

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`)
})