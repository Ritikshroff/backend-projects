# Blog Platform API Documentation

## Base URL
`http://localhost:8000/api/v1`

---

## Authentication Endpoints

### Register
- **POST** `/users/register`
- **Body**: `multipart/form-data`
  - `fullName`, `email`, `username`, `password`
  - `avatar` (file), `coverImage` (file, optional)

### Login
- **POST** `/users/login`
- **Body**: `{ "email": "...", "password": "..." }`

### Logout
- **POST** `/users/logout` (Protected)

---

## Post Endpoints

### Create Post
- **POST** `/posts`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `multipart/form-data`
  - `content` (required)
  - `images` (array, max 5 files)

### Get Feed (All Posts)
- **GET** `/posts/feed?page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`

### Get User's Posts
- **GET** `/posts/user/:userId?page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`

### Get Single Post
- **GET** `/posts/:postId`
- **Headers**: `Authorization: Bearer <token>`

### Update Post
- **PATCH** `/posts/:postId`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "content": "..." }`

### Delete Post
- **DELETE** `/posts/:postId`
- **Headers**: `Authorization: Bearer <token>`

---

## Like Endpoints

### Toggle Like
- **POST** `/posts/:postId/like`
- **Headers**: `Authorization: Bearer <token>`

### Get Post Likes
- **GET** `/posts/:postId/likes`
- **Headers**: `Authorization: Bearer <token>`

---

## Comment Endpoints

### Add Comment
- **POST** `/posts/:postId/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "content": "..." }`

### Get Post Comments
- **GET** `/posts/:postId/comments?page=1&limit=20`
- **Headers**: `Authorization: Bearer <token>`

### Delete Comment
- **DELETE** `/posts/comments/:commentId`
- **Headers**: `Authorization: Bearer <token>`

---

## Testing with Postman/Thunder Client

1. **Register** a new user
2. **Login** to get cookies
3. **Create** a post with images
4. **Get Feed** to see all posts
5. **Like** a post
6. **Add Comment** to a post
7. **Get Comments** for a post
