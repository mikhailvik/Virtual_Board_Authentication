const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

router.post('/login', async (req, res) => {
    // Find user by email
    const regUser = await prisma.users.findUnique({
        where: { email: req.body.email }
    })
    // User does not exist
    if (regUser === null) {
        console.log(`user not found`)
        return res.status(401).send({ msg: "Authentication failed" })
    }
    // Compare entered password with hashed password
    const match = await bcrypt.compare(req.body.password, regUser.password)
    // if password wrong return error
    if (!match) {
        console.log(`wrong password`)
        return res.status(401).send({ msg: "Authentication failed" })
    }
    // Create JWT token for authenticated user
    const token = await jwt.sign({
        sub: regUser.id,
        email: regUser.email,
        name: regUser.name
    }, process.env.JWT_SECRET, { expiresIn: '30d' })

    res.send({
        msg: "Login success!",
        id: regUser.id,
        jwt: token
    })
})


// Create a new user
router.post('/', async (req, res) => {

    // Check that all required fields are provided
    if (!req.body.email || !req.body.password || !req.body.name) {
        return res.status(400).send({
            msg: "Email, name and password are required"
        })
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.users.findUnique({
        where: { email: req.body.email }
    })

    // Do not allow duplicate users if something we will have error msg
    if (existingUser) {
        return res.status(409).send({
            msg: "User already exists"
        })
    }

    // Hash the password before saving it to the database
    const hashPass = await bcrypt.hash(req.body.password, 10)

    // Save the new user in my database
    const user = await prisma.users.create({
        data: {
            email: req.body.email,
            password: hashPass,
            name: req.body.name
        }
    })

    // Return the id of the created user
    res.status(201).send({
        msg: "User created",
        id: user.id
    })
})

module.exports = router