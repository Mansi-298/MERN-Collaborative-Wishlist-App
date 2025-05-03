## Shared Wishlist App

A real-time collaborative wishlist platform where users can create, manage, and interact with shared wishlists — ideal for planning group shopping sprees.

---

## 🚀 Features

### 👤 User Authentication
- Sign up and log in (Firebase Auth / Mock authentication)
- Basic user session management

### 📋 Wishlist Management
- Create and name new wishlists
- Invite other users to a wishlist (mocked)

### 🛍️ Product Management
- Add product: name, image URL, and price
- Edit or delete products
- Display who added/edited each product (username or email)

### 👥 Collaboration
- Shared wishlists between multiple users
- Real-time UI updates (basic or mocked)

---

## 🧑‍💻 Tech Stack Used

### Frontend
- React.js
- Axios

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB (with Mongoose ODM)

---

## 📁 Folder Structure

```
📦shared-wishlist-app/
 ┣ 📁client/              # React Frontend
 ┃ ┣ 📁components/
 ┃ ┣ 📁pages/
 ┃ ┣ 📄App.js
 ┃ ┗ 📄index.js
 ┣ 📁server/              # Node.js Backend
 ┃ ┣ 📁routes/
 ┃ ┣ 📁models/
 ┃ ┣ 📁controllers/
 ┃ ┣ 📄server.js
 ┃ ┗ 📄.env
 ┣ 📄README.md
 ┗ 📄package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shared-wishlist-app.git
cd shared-wishlist-app
```

### 2. Setup Backend

```bash
cd server
npm install
# Add a .env file with your MongoDB connection string
npm start
```

### 3. Setup Frontend

```bash
cd client
npm install
npm start
```

---

## 📸 Screenshots

### 🔐 Signup/Login Page
![Login](https://github.com/user-attachments/assets/acb8f9ff-0782-4cbc-9597-5397b0efeed9)

![Signup](https://github.com/user-attachments/assets/745fdef8-6a89-4762-b875-da8e80e66d57)

### 🗂️ Wishlist Dashboard
![Wishlist](https://github.com/user-attachments/assets/4b891e3b-0cc1-450a-b349-9e82d13792c7)

![Wishlist Dashboard 1](https://github.com/user-attachments/assets/19431d17-e0ab-4d49-a3d2-19c7b18fd1cc)

![Wishlist Dashboard 2](https://github.com/user-attachments/assets/5530d24f-cc50-4ac3-881d-270a32ae6f63)

### ✉️ Invite Mock UI
![Invite UI 1](https://github.com/user-attachments/assets/459b17f6-3146-4da3-a8ef-805be0fc1a3c) 

![Invite UI 2](https://github.com/user-attachments/assets/b21f48d2-9f77-40f8-8e39-f1e0ac9c60df)  

---

## 🔗 Live Demo

> https://drive.google.com/file/d/1jjtw9bOobGNNgfJLeNeym0000-j8Apiw/view?usp=sharing

---

## 💡 Assumptions or Limitations

- Invitation feature is mocked, not real-time linked via email or notification.
- Basic error handling; no advanced validations.
- Real-time sync is simulated with state refresh; not implemented with sockets.
- Authentication is either Firebase or mocked in backend.

---

## 📈 Scalability and Improvement Ideas

- Use **Socket.IO** or **Firebase Realtime DB** for true real-time updates.
- Add **role-based permissions** for wishlists (owner, editor, viewer).
- Integrate **email invites** or **shareable links**.
- Use **Redux Toolkit** or **React Query** for better state/API management.
- Add **unit tests** (Jest, React Testing Library).
- Deploy using **Docker** and orchestrate with **Kubernetes** for scale.

---

## ✅ Functionality Checklist

- [x] Signup/Login
- [x] Wishlist CRUD
- [x] Product CRUD
- [x] Show user per product
- [x] Mock invite feature
- [x] Database integration with MongoDB

---

## ✨ Code Quality & Structure

- Clean, modular file structure (controllers, models, routes)
- Reusable frontend components
- RESTful API structure
- Well-commented code

---

## 🎨 UI & UX

- Minimal, intuitive UI
- Responsive layout
- User-friendly product form & interaction

---

## 🧹 Git & Deployment

- Meaningful commit messages
- Clear branch structure (feature/bug/main)
- Ready for deployment via Netlify (frontend) + Render (backend)

---
