# 🚀 User Management Server

> A secure and scalable Node.js backend API for handling user management, authentication, and admin features.
> The project is structured in a clean and organized way, making it easy to understand, maintain, and extend as it grows.

---

## ✨ What This Project Does

This server handles:

- 🔐 User authentication & authorization (JWT-based)
- 📩 OTP verification (email-based)
- 👤 Role-based access control (Admin / User)
- 📊 Admin activity logging
- 📧 Email notifications
- 📁 File uploads
- 🚦 Rate limiting for API protection

It’s structured in a way that supports real-world production use.

---

## 🛠 Tech Stack

- **Node.js** – Runtime
- **Express.js** – API framework
- **MongoDB** – Database
- **Mongoose** – ODM
- **JWT** – Authentication
- **Nodemailer** – Email service

---

## 📦 Installation

Clone the repository:

```bash
git clone [<repo-url>](https://github.com/vashisht-Radhe/user-management-server)
cd user-management-server
```

Install dependencies:

```bash
npm install
```

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory and add the required variables:

```env
PORT=5500
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

> Make sure we never commit our `.env` file.

---

## ▶️ Running the Server

Start the development server:

```bash
npm start
```

If you're using nodemon:

```bash
npm run dev
```

Server will run on:

```
http://localhost:5500
```

---

## 📁 Project Structure

```
src/
│
├── controllers/    → Handle incoming requests
├── services/       → Business logic layer
├── models/         → Mongoose schemas
├── routes/         → API routes
├── middlewares/    → Custom Express middlewares
├── validations/    → Request validation logic
├── emails/         → Email templates & sending logic
├── utils/          → Helper utilities
├── config/         → App configuration
├── constants/      → Global constants
└── database/       → MongoDB connection setup

uploads/            → Uploaded files storage
```

The architecture follows:

```
Route → Controller → Service → Model
```

This keeps the code clean and scalable.

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Admin-protected routes
- OTP verification for sensitive actions

---

## 📊 Activity Logging

Admin actions such as:

- Role updates
- User deactivation
- User deletion

are stored in the activity log for audit purposes.

---

## 🚦 API Protection

- Rate limiting
- Input validation
- Error handling middleware
- Secure environment variable usage

---

## 📌 Future Improvements (Optional Ideas)

- Cursor-based pagination for large datasets
- Redis caching
- API documentation (Swagger)
- Docker support
- Unit & integration tests

---

## 🤝 Contributing

Feel free to fork the project and submit pull requests.

---

## 📄 License

This project is open-source and available under the MIT License.

---
