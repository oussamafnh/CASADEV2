# CASADEV Backend

CASADEV is a social media platform backend built with **Node.js**, **Express**, and **MongoDB**. It provides a robust API for user management, posts, comments, likes, follows, search functionality, and more.

## Live Demos

- **Live API for Testing in Postman:** [https://casadev2-4aiv.onrender.com](https://casadev2-4aiv.onrender.com)  
  Use this link to test the API endpoints directly via Postman or any HTTP client.  
- **Live Application Demo:** [CASADEV Frontend Application](https://casadev.vercel.app)  
  Explore the full functionality of CASADEV. The frontend repository for this demo is available [here](https://github.com/oussamafnh/CASADEV).



## Features

- **User Authentication:**  Sign up, log in, log out, and JWT-based token management.
- **Profile Management:**   Avatar, bio, and profile setup.
- **Post Management:**      Create, edit, like, save, and fetch posts.
- **Comments:**             Add, edit, and delete comments on posts.
- **Follow System:**        Follow and unfollow users with follower/following lists.
- **Search:**               Search for posts and users dynamically.
- **Reports:**              Create and manage reports for inappropriate content.
- **More Upcoming Features**
---

## Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

---

## API Endpoints

### **Authentication**
**Base Route:** `/api/auth`

- **POST** `/login` - Log in a user.
- **POST** `/signup` - Register a new user.
- **GET** `/user` - Get the logged-in user by token.
- **GET** `/user/:id` - Get user details by ID.
- **GET** `/logout` - Log out the user.
- **POST** `/setup-profile` - Complete user profile setup.
- **GET** `/avatars` - Fetch a list of available avatars.
- **GET** `/avatar/:id` - Get details of a specific avatar by ID.
- **PUT** `/avatar` - Set an avatar for the logged-in user.

---

### **Posts**
**Base Route:** `/api/post`

- **POST** `/create` - Create a new post.
- **GET** `/` - Get all posts (paginated).
- **GET** `/latest` - Get the latest posts (paginated).
- **GET** `/author/:userId` - Get all posts by a specific user.
- **GET** `/myposts` - Get posts created by the logged-in user.
- **GET** `/count/:userId` - Get the total number of posts by a user.
- **POST** `/:postId/like` - Like a post.
- **DELETE** `/:postId/unlike` - Unlike a post.
- **GET** `/:postId/likes` - Fetch all likes for a post.
- **GET** `/mostliked` - Fetch the most liked posts.
- **GET** `/:id` - Get details of a specific post by ID.
- **PUT** `/:id/edit` - Edit a post.
- **DELETE** `/delete/:postId` - Delete a post.

---

### **Search**
**Base Route:** `/api/search`

- **GET** `/` - Search for users or posts dynamically.

---

### **Comments**
**Base Route:** `/api/comment`

- **POST** `/:postId` - Add a comment to a post.
- **GET** `/:postId` - Fetch all comments for a specific post.
- **PUT** `/:commentId` - Edit a comment.
- **DELETE** `/:commentId` - Delete a comment.

---

### **Saved Posts**
**Base Route:** `/api/save`

- **POST** `/:postId/save` - Save/unsave a post.
- **GET** `/saved_posts` - Fetch all saved posts for the logged-in user.

---

### **Follow System**
**Base Route:** `/api/follow`

- **POST** `/toggle` - Toggle follow/unfollow a user.
- **GET** `/:userId/followers` - Get followers of a user.
- **GET** `/:userId/following` - Get users a specific user is following.

---

### **Reports**
**Base Route:** `/api/reports`

- **POST** `/` - Create a report for inappropriate content.

---

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/casadev-backend.git
   cd casadev-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and configure your environment variables.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. The backend will run on `http://localhost:8090` by default.

---

## Deployment

This project is ready for deployment on platforms like **Render**, **Heroku**, or any other Node.js hosting service. Update the `MONGO_URI` and `JWT_SECRET` in your environment during deployment.

---

## License

This project is licensed under the MIT License.
