//Setting cors origins is simply saying, what domains can access our server?

const allowedOrigins = [
    '*',
    'http://localhost:3000',
    'http://localhost:5173',
    "https://vaarbzapp.onrender.com",
    "http://vaarbzapp.onrender.com",
    "exp://192.168.0.104:8081",
 
]

module.exports = allowedOrigins