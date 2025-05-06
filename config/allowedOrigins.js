//Setting cors origins is simply saying, what domains can access our server?

const allowedOrigins = [
    '*',
    'http://localhost:3000',
    'http://localhost:5173/'
]

module.exports = allowedOrigins