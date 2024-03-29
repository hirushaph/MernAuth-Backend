## 🎯 Login and Registration System Using MERN Stack - Backend

[![Node.js CI](https://github.com/hirushaph/MernAuth-Backend/actions/workflows/node.js.yml/badge.svg)](https://github.com/hirushaph/MernAuth-Backend/actions/workflows/node.js.yml)

This project is a backend Login and Registration System. It encompasses key functionalities such as registration, login, input validation, JWT authentication, refresh tokens, password reset, and OTP support. This backend solution ensures secure and efficient user authentication for web applications built with the MERN stack.

### 🔰 Features

- ✅ Registration
- ✅ Login
- ✅ Input Validation
- ✅ JWT Auth Token
- ✅ Refresh Token
- ✅ Password Reset
- ✅ OTP Support
- ✅ Api Access Limit
- ⏳ &nbsp;Google Auth (coming soon)

### ⚙ Used Tools and Technologies

- NodeJS
- ExpressJS
- MongoDB
- Json Web Token
- Nodemailer

### 🚀 **How to Deploy locally**

#### 1. Install NodeJS on your System

#### 2. Clone Repository to your local machine

    git clone https://github.com/hirushaph/MernAuth-Backend.git

#### 3. Go to MernAuth Directory

    cd MernAuth-backend

#### 4. Install required node modules

    npm install

#### 5. Create .env File inn root directory

    After creating .env file, your folder structer look like this

    📂 MernAuth-Backend
        📂 node-modules
        📂 src
           📂 Controllers
           📂 Models
           📂 Router
           📂 and others
           📄 app.js
        📄.env  <------This is the file you need to create
        📄.gitignore
        📄 package.json
        📄 README.md

> [!IMPORTANT]
> Copy the code below to the .env file and fill in all required variables. 👇

    # define development or production ( default is development )
    # If you are deploying for production, set this to production
    STATUS=
    # Default port is 3000.
    # Define the port here if you want to change that.
    PORT=
    MONGODB_URL=

    # Enter your frontend application url here (only if you have frontend)
    FRONTEND_URL=

    # You can generate a secret by running this command in the terminal:
    # "node -e "console.log(require('crypto').randomBytes(32).toString('hex'))".
    JWT_ACCESS_SECRET=
    JWT_REFRESH_SECRET=

    # Smtp Details for email features
    HOST=
    EPORT=
    USER=
    PASSWORD=

#### 6. Start the server

    npm start

---

### 📌 TODO

- Document Api Endpoints
- Add integration Tests
- User Roles
- OAuth
- Add better comments
