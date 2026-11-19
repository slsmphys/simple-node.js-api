import { createServer } from 'http'
import { users } from './users.js'

const PORT = 3000

// Get all users
// Route handler for GET /api/users
const getUsers = ((req, res) => {
  // respond to the request with all users
  res.write(JSON.stringify(users))
  res.end()
})

// Get user by id
// Route handler for GET /api/users/:id
const getUserById = ((req, res) => {
  const targetUserId = req.url.split('/')[3] // userId will be in the 4th element
  const user = users.find((user) => user.id === parseInt(targetUserId))

  res.setHeader('Content-Type', 'application/json')

  if (user) {
    res.write(JSON.stringify(user))
  } else {
    res.statusCode = 404
    res.write(JSON.stringify({ message: `User with id=${targetUserId} not found` }))
  }
  res.end()
})

// Add a new user
// Route handler for POST /api/users
const createUser = ((req, res) => {
  let body = ''

  // The new user data will be sent in the body of the request so we listen for data
  req.on('data', (chunk) => {
    body += chunk.toString()
  })

  // we listen for the 'end' event to know when all the data is received
  // we then create the new user object from the data
  req.on('end', () => {
    const newUser = JSON.parse(body)

    users.push(newUser)

    // Respond to the request with a 201 response and return the new user
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify(newUser))
    res.end()
  })
})

// Delete a user by id
// Route handler for DELETE /api/users/:id
const deleteUserById = ((req, res) => {
  const targetUserId = req.url.split('/')[3] // id will be in the 4th element

  // Verify that the user with the targetUserId exists
  const index = users.findIndex((user) => user.id === parseInt(targetUserId))

  res.setHeader('Content-Type', 'application/json')

  if (index > -1) {
    // If they exist, remove the user by their index from the array
    users.splice(index, 1)

    // Respond with a 200 status and send back the new list of users
    res.statusCode = 200
    res.write(JSON.stringify(users))
  } else {
    // If the user with that id is not found
    // Respond with a 404 status and an error message
    res.statusCode = 404
    res.write(JSON.stringify({ message: `User with id=${targetUserId} not found`}))
  }
  res.end()
})

// Update a user by id
// Route handler for PATCH /api/users/:id
const updateUserById = ((req, res) => {
  const targetUserId = req.url.split('/')[3] // id will be held in the 4th element

  // Verify that the user with the id exists
  const index = users.findIndex((user) => user.id === parseInt(targetUserId))

  res.setHeader('Content-Type', 'application/json')

  if (index > -1) {
    // If the user exists
    let body = ''

    // listen for updated data in the request
    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    // all data has been received, create an updated user from the data
    req.on('end', () => {
      const updatedUser = JSON.parse(body)

      // replace the existing user with the updated user
      users[index] = {
        ...users[index],
        ...updatedUser
      }

      res.write(JSON.stringify(users[index]))
      res.end()
    })
  } else {
    // if the existing user cannot be found, send back a 404 response with error message
    res.statusCode = 404
    res.write(JSON.stringify({ message: `User with id=${targetUserId} not found`}))
    res.end()
  }
})

// Route Not Found handler
const notFound = ((req, res) => {
  // respond with a 404 status code and error message
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.write(JSON.stringify({ message: 'Route not found' }))
  res.end()
})

const server = createServer((req, res) => {
  if (req.url === '/api/users') {
    if (req.method === 'GET') {
      getUsers(req, res)
    } else if (req.method === 'POST') {
      createUser(req, res)
    } else {
      // Method not allowed on this route
      res.statusCode = 405
      res.end()
    }
  } else if (req.url.match(/^\/api\/users\/([0-9]+)/)) {
    if (req.method === 'GET') {
      getUserById(req, res)
    } else if (req.method === 'DELETE') {
      deleteUserById(req, res)
    } else if (req.method === 'PATCH') {
      updateUserById(req, res)
    } else {
      // Method not allowed on this route
      res.statusCode = 405
      res.end()
    }
  } else {
    // invalid route
    notFound(req, res)
  }
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
