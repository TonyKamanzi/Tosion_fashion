# Tosion Fashion

A modern full-stack fashion e-commerce platform built with **Next.js, TypeScript, Express.js, MongoDB, and Google OAuth**.

Tosion Fashion is designed to provide a clean, editorial-style shopping experience while giving administrators the tools to manage products and content through a dedicated admin side.

---

## ✨ Overview

**Tosion Fashion** is a modern fashion e-commerce application focused on combining a premium visual experience with practical e-commerce functionality.

The project demonstrates how a production-style fashion platform can be built with a separate frontend and backend architecture.

### The platform includes:

* 🛍️ Product browsing and discovery
* 🔐 Email/password authentication
* 🔵 Google authentication
* 👤 Customer accounts
* 🛠️ Admin product management
* 🖼️ Product image management
* 🏷️ Product categories and pricing
* 📱 Responsive design
* ⚡ Modern Next.js frontend
* 🔌 REST API backend
* 🗄️ MongoDB database

---

## 🎯 Why Tosion Fashion?

Many e-commerce projects focus mainly on functionality. Tosion Fashion explores how **functionality and visual presentation can work together**.

The goal is to create an experience that feels closer to a modern fashion brand than a traditional product-management application.

The project is also intended as a practical demonstration of:

* Full-stack TypeScript development
* Modern Next.js architecture
* REST API design
* Authentication and authorization
* Database integration
* Admin/customer separation
* Production-oriented deployment
* Responsive e-commerce UI

---

## 🖥️ Demo

> 🚧 Live demo coming soon / currently under development.

Add your deployed website here when available:

**Live Demo:** https://tosion-fashion-livid.vercel.app/

---

## 📸 Screenshots

Add screenshots of the main experience here.

### Homepage

---

### Product Page

---

### Admin Dashboard

---

---

## 🧩 Features

### Customer

* Browse fashion products
* Explore products by category
* View detailed product information
* Select available sizes
* Create an account
* Sign in with email and password
* Continue with Google
* Manage customer sessions
* Responsive shopping experience

### Admin

* Admin authentication
* Product management
* Create products
* Update products
* Delete products
* Manage product pricing
* Manage product categories
* Manage product images

### Authentication

Tosion Fashion supports multiple authentication methods:

* Email/password authentication
* Google OAuth
* Session-based authentication
* Protected routes
* Customer/admin authorization

---

## 🏗️ Project Architecture

The project is organized into separate frontend and backend applications.

```text
Tosion_fashion/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── types/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── ...
│   └── ...
│
├── .gitignore
└── README.md
```

### Frontend

The frontend is responsible for:

* User interface
* Navigation
* Product presentation
* Authentication UI
* Customer experience
* Admin interface
* API communication

### Backend

The backend provides:

* REST API
* Authentication
* Authorization
* Product management
* Database communication
* Session management
* Google OAuth integration

---

## 🛠️ Tech Stack

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Axios**

### Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* **Mongoose**
* **Express Session**

### Database

* **MongoDB**

### Authentication

* Email & password
* **Google OAuth 2.0**
* Session-based authentication

### Development & Deployment

* Git
* GitHub
* Vercel
* Render

---

## 🚀 Getting Started

### Prerequisites

Before running the project, make sure you have installed:

* Node.js 18+
* npm
* MongoDB or a MongoDB Atlas database
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/TonyKamanzi/Tosion_fashion.git

cd Tosion_fashion
```

---

## 2. Install frontend dependencies

```bash
cd frontend

npm install
```

---

## 3. Install backend dependencies

Open another terminal:

```bash
cd backend

npm install
```

---

## 4. Configure environment variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=2000

MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_CALLBACK_URL=http://localhost:2000/auth/google/callback
```

Create the frontend environment file if your frontend requires environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:2000
```

> Never commit your `.env` files or API credentials to GitHub.

---

## 5. Start the backend

From the `backend` directory:

```bash
npm run dev
```

The API should now be available at:

```text
http://localhost:2000
```

---

## 6. Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## 🔐 Google Authentication

Tosion Fashion supports Google OAuth authentication.

To enable it locally:

1. Create a project in Google Cloud.
2. Configure OAuth credentials.
3. Add your local callback URL.
4. Add the Google credentials to the backend `.env` file.

Example callback URL:

```text
http://localhost:2000/auth/google/callback
```

For production, replace the local callback URL with your deployed backend callback URL.

---

## 🔄 Application Flow

The general authentication flow looks like this:

```text
Customer
   │
   ▼
Next.js Frontend
   │
   │ HTTP Requests
   ▼
Express.js API
   │
   ├── Authentication
   ├── Authorization
   └── Product APIs
           │
           ▼
       MongoDB
```

For Google authentication:

```text
Customer
   │
   ▼
Next.js
   │
   ▼
Express API
   │
   ▼
Google OAuth
   │
   ▼
OAuth Callback
   │
   ▼
User Session
```

---

## 📁 Main Application Areas

The application is divided into two primary experiences:

### Customer

```text
Customer
 ├── Home
 ├── Products
 ├── Categories
 ├── Product Details
 ├── Account
 └── Authentication
```

### Admin

```text
Admin
 ├── Dashboard
 ├── Products
 ├── Add Product
 ├── Edit Product
 └── Product Management
```

This separation allows the application to provide different functionality and permissions depending on the user's role.

---

## 🔒 Security Considerations

The project is designed with several common web security practices in mind:

* Environment variables for secrets
* Password authentication
* Session-based authentication
* Protected backend routes
* Role-based access control
* Google OAuth
* CORS configuration
* Server-side validation

> Security configuration should be reviewed and hardened further before using the project in a large-scale production environment.

---

## 📈 Future Improvements

Tosion Fashion is an evolving project.

Planned improvements include:

* 💳 Payment integration
* 🔎 Advanced product search
* 🎯 Product recommendations
* 📊 Admin analytics
* 📧 Transactional emails
* 🚚 Order tracking
* 🖼️ Improved media management
* ⚡ Performance optimization
* 🧪 Automated testing

---

## 🤝 Contributing

Contributions are welcome.

If you have an idea that could improve Tosion Fashion:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "feat: add your feature"
```

5. Push your branch

```bash
git push origin feature/your-feature
```

6. Open a Pull Request

---

## 📚 What This Project Demonstrates

Tosion Fashion is more than a fashion storefront. It is a practical full-stack project demonstrating how different technologies work together to build a modern web application.

It covers:

* Frontend architecture
* Backend architecture
* REST APIs
* Database modeling
* Authentication
* OAuth
* Sessions
* Authorization
* Admin/customer roles
* Responsive UI
* API integration
* Deployment
* Environment configuration

---

## 👨‍💻 Author

**Tony Kamanzi**

Full-Stack Developer & Software Development Student

GitHub:
https://github.com/TonyKamanzi

---

## 📄 License

This project is currently available for learning and development purposes.

---

⭐ If you find Tosion Fashion useful or interesting, consider giving the repository a star.
