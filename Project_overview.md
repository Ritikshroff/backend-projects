# Full Stack Developer Interview - Project Presentation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Backend Questions](#backend-questions)
4. [Frontend Questions](#frontend-questions)
5. [Database & Schema](#database--schema)
6. [Authentication & Security](#authentication--security)
7. [Challenges & Solutions](#challenges--solutions)
8. [Deployment & DevOps](#deployment--devops)
9. [Code Quality & Best Practices](#code-quality--best-practices)
10. [Performance & Optimization](#performance--optimization)

---

## Project Overview

### Q: Can you give me a quick overview of your project?

**A:** "I built a full-stack social media blog platform with features similar to Twitter/Instagram. Users can:
- Register and login with secure authentication
- Create posts with text and images
- Like and comment on posts
- View a personalized feed
- Manage their profiles with avatars and cover images
- Follow/unfollow other users (via subscriptions)

**Tech Stack:**
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React with TypeScript and Vite
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary for images
- **Deployment**: Railway (backend) and Vercel (frontend)"

### Q: Why did you choose this tech stack?

**A:** "I chose this MERN-like stack because:
1. **Node.js/Express**: Non-blocking I/O makes it perfect for handling multiple concurrent requests, which is essential for a social media platform
2. **MongoDB**: Document-based structure is ideal for social media data where posts, comments, and user relationships don't fit well in rigid SQL schemas
3. **React + TypeScript**: Type safety helps catch errors during development, and React's component-based architecture makes the UI maintainable
4. **JWT**: Stateless authentication scales better than sessions for distributed systems
5. **Cloudinary**: Handles image optimization, transformations, and CDN delivery automatically"

---

## Technical Architecture

### Q: Walk me through the architecture of your application

**A:** "The application follows a 3-tier architecture:

**1. Frontend (React + TypeScript)**
- Component-based UI with reusable components
- Axios for API communication with interceptors for auth
- LocalStorage for token persistence
- Automatic token refresh on 401 errors

**2. Backend (Node.js + Express)**
- RESTful API design with versioning (/api/v1)
- Layered architecture: Routes → Controllers → Models
- Middleware for authentication, error handling, and file uploads
- Environment-based configuration

**3. Database (MongoDB)**
- 5 main collections: Users, Posts, Comments, Likes, Subscriptions
- Mongoose for schema validation and relationships
- Aggregation pipelines for complex queries (like feed generation)

**Flow Example - Creating a Post:**
1. User submits form in React
2. Axios interceptor adds Authorization header with JWT
3. Express receives request → Auth middleware validates token
4. Multer middleware handles image uploads
5. Controller uploads images to Cloudinary
6. Post document created in MongoDB
7. Response sent back to frontend
8. UI updates with new post"

### Q: How does your folder structure look like?

**A:** "I follow a feature-based structure:

**Backend:**
```
src/
├── models/          # Mongoose schemas (User, Post, Comment, Like)
├── controllers/     # Business logic for each feature
├── routes/          # API endpoints definition
├── middlewares/     # Auth, error handling, file upload
├── utils/           # Helpers (validators, error classes, Cloudinary)
├── db/              # Database connection
├── app.js           # Express app setup
└── index.js         # Server entry point
```

**Frontend:**
```
src/
├── components/      # Reusable UI components
├── pages/           # Route-level components
├── api/             # Axios configuration
└── assets/          # Static files
```

This separation makes the codebase scalable and easy to maintain."

---

## Backend Questions

### Q: Explain your API design and routing structure

**A:** "I follow RESTful principles with clear resource-based routing:

**Users API** (`/api/v1/users`):
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh access token
- `GET /current-user` - Get logged-in user details
- `GET /c/:username` - Get user channel/profile
- `PATCH /update-account` - Update user details
- `PATCH /avatar` - Update avatar
- `PATCH /cover-image` - Update cover image
- `POST /change-password` - Change password

**Posts API** (`/api/v1/posts`):
- `POST /` - Create new post
- `GET /feed` - Get paginated feed
- `GET /:postId` - Get single post
- `GET /user/:userId` - Get user's posts
- `PATCH /:postId` - Update post
- `DELETE /:postId` - Delete post
- `POST /:postId/like` - Toggle like
- `POST /:postId/comments` - Add comment
- `GET /:postId/comments` - Get post comments

All endpoints return consistent JSON structure:
```json
{
  \"statuscode\": 200,
  \"success\": true,
  \"message\": \"User-friendly message\",
  \"data\": { ... }
}
```"

### Q: How did you implement authentication?

**A:** "I implemented JWT-based authentication with dual tokens:

**Registration Flow:**
1. User submits email, username, password, avatar, cover image
2. Validate input (email format, password strength, username format)
3. Check if user already exists
4. Hash password using bcrypt (salt rounds: 10)
5. Upload images to Cloudinary
6. Create user in MongoDB
7. Return success response

**Login Flow:**
1. User provides email/username and password
2. Find user in database
3. Verify password using bcrypt.compare()
4. Generate Access Token (15min expiry) and Refresh Token (7 days)
5. Store refresh token in database
6. Send both tokens in response body AND as httpOnly cookies
7. Frontend stores tokens in localStorage

**Token Generation:**
```javascript
// Access Token (short-lived)
jwt.sign(
  { id: user._id, email: user.email },
  SECRET,
  { expiresIn: '15m' }
)

// Refresh Token (long-lived)
jwt.sign(
  { id: user._id },
  REFRESH_SECRET,
  { expiresIn: '7d' }
)
```

**Why two tokens?**
- Access token expires quickly (15min) for security
- Refresh token allows seamless re-authentication without login
- If access token is stolen, it's only valid for 15 minutes"

### Q: How do you protect routes?

**A:** "I created an authentication middleware (`varifyJwt`) that:

1. Extracts token from cookies OR Authorization header
2. Verifies JWT signature and expiry
3. Decodes token to get user ID
4. Fetches user from database (excluding password)
5. Attaches user to request object (`req.user`)
6. Calls `next()` to proceed

Protected routes use this middleware:
```javascript
router.route('/logout').post(varifyJwt, logoutUser)
router.route('/current-user').get(varifyJwt, getCurrentUser)
```

**Authorization (ownership check):**
For operations like delete/update, I verify ownership:
```javascript
if (post.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, \"You don't have permission\")
}
```"

### Q: Explain your error handling implementation

**A:** "I implemented a comprehensive global error handling system:

**1. Custom Error Classes:**
- `ApiError` - For operational errors (validation, not found, etc.)
- Includes statuscode, message, and field-level errors

**2. Global Error Handler Middleware:**
Catches ALL errors and handles:
- Mongoose ValidationError → 400 with field details
- MongoDB Duplicate Key (E11000) → 409
- Mongoose CastError (invalid ObjectId) → 400
- JWT errors → 401
- Multer file upload errors → 400
- Unexpected errors → 500

**3. Environment-Aware:**
```javascript
if (process.env.NODE_ENV === 'development') {
  // Show stack traces
} else {
  // Only user-friendly messages
}
```

**4. Validation Utilities:**
- `validateObjectId()` - Prevents invalid MongoDB IDs
- `validateEmail()` - Email format validation
- `validatePassword()` - Password strength (min 8 chars)
- `validatePagination()` - Sanitizes page/limit params

**Benefits:**
- Consistent error format for frontend
- Clear messages for users and developers
- No sensitive data leakage in production
- Easier debugging with structured errors"

### Q: How do you handle file uploads?

**A:** "I use Multer for local upload and Cloudinary for storage:

**Process:**
1. Multer middleware saves files temporarily to `./public/temp`
2. Controller receives file path from `req.file.path`
3. Upload to Cloudinary using their SDK
4. Save Cloudinary URL in database
5. Delete local temp file (Cloudinary handles this)

**Configuration:**
```javascript
const storage = multer.diskStorage({
  destination: './public/temp',
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })
```

**Why Cloudinary?**
- Automatic image optimization
- CDN delivery for fast loading
- Image transformations (resize, crop, format conversion)
- Free tier is generous for development"

### Q: How did you implement the feed/pagination?

**A:** "I used MongoDB aggregation pipeline with mongoose-aggregate-paginate:

**Feed Algorithm:**
```javascript
const aggregate = Post.aggregate([
  // Lookup user details
  {
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: '_id',
      as: 'owner'
    }
  },
  // Flatten owner array
  { $addFields: { owner: { $first: '$owner' } } },
  // Sort by most recent
  { $sort: { createdAt: -1 } }
])

// Paginate
const posts = await Post.aggregatePaginate(aggregate, {
  page: 1,
  limit: 10
})
```

**Response includes:**
- `docs` - Array of posts
- `totalDocs` - Total count
- `hasNextPage` - Boolean for infinite scroll
- `page`, `limit` - Current pagination state

**Why aggregation over simple find()?**
- Joins user data in single query (avoid N+1 problem)
- Better performance for complex queries
- Flexibility for future features (filtering, recommendations)"

---

## Frontend Questions

### Q: How did you structure your React application?

**A:** "I used a combination of:

**1. Component Architecture:**
- Reusable components (Button, Input, PostCard, Header)
- Page components for routes (Login, Register, Feed, Dashboard)
- Layout component for consistent structure

**2. State Management:**
- React hooks (useState, useEffect) for local state
- No Redux - kept it simple since state isn't deeply nested
- Could add React Query for better caching in future

**3. Routing:**
- React Router v6 for navigation
- Protected routes wrapped in Layout component
- Public routes (Login, Register) without layout

**4. API Communication:**
```javascript
// Centralized Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

// Request interceptor - adds auth header
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handles token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try to refresh token
      // If successful, retry original request
      // If failed, redirect to login
    }
  }
)
```"

### Q: How do you handle authentication on the frontend?

**A:** "Multi-layered approach:

**1. Token Storage:**
- Access token in localStorage (easily accessible for requests)
- Refresh token also in localStorage as backup

**2. Automatic Auth Header:**
- Axios request interceptor adds `Authorization: Bearer {token}`
- Happens automatically for all API calls

**3. Token Refresh:**
```javascript
if (error.response?.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    // Call /refresh-token endpoint
    const { NewAccessToken } = await refreshTokenAPI()
    // Update localStorage
    localStorage.setItem('accessToken', NewAccessToken)
    // Retry original request with new token
    return axios(originalRequest)
  }
}
```

**4. Route Protection:**
- Could add PrivateRoute wrapper component
- Currently relying on API rejecting unauthorized requests
- Frontend shows login page on 401 redirect

**Why localStorage over cookies?**
- Easier to access for Authorization header
- Works well with cross-origin requests (Vercel → Railway)
- HttpOnly cookies had issues in production"

### Q: Why TypeScript? What benefits did you get?

**A:** "TypeScript provided several benefits:

**1. Type Safety:**
```typescript
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar: string;
}

const [profile, setProfile] = useState<UserProfile | null>(null)
```

**2. Better IDE Support:**
- Autocompletion for API responses
- Catch errors before runtime
- Easier refactoring

**3. Self-Documenting Code:**
```typescript
interface PostCardProps {
  post: Post;
  onUpdate: () => void;
  currentUserId: string;
}
```

**4. Prevented Bugs:**
- Typos in object properties caught immediately
- Wrong function arguments flagged
- Null/undefined checks enforced

**Challenges:**
- Initial learning curve with typing Axios responses
- Some third-party libraries lack type definitions
- Had to use `any` occasionally (which I flagged with comments)"

---

## Database & Schema

### Q: Explain your database schema design

**A:** "I designed 5 main collections with relationships:

**1. User Schema:**
```javascript
{
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  avatar: String,
  coverImage: String,
  password: { type: String, required: true },  // Hashed
  refreshToken: String,
  watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }]
}
```

**2. Post Schema:**
```javascript
{
  content: String,
  images: [String],  // Cloudinary URLs
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  timestamps: true
}
```

**3. Comment Schema:**
```javascript
{
  content: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamps: true
}
```

**4. Like Schema:**
```javascript
{
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  likedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}
```

**5. Subscription Schema:**
```javascript
{
  subscriber: { type: Schema.Types.ObjectId, ref: 'User' },
  channel: { type: Schema.Types.ObjectId, ref: 'User' }
}
```

**Design Decisions:**
- Denormalized counts (likes, comments) for performance
- Separate Like/Comment documents for flexibility
- Used ObjectId references for relationships
- Timestamps on all schemas for audit trail"

### Q: How do you handle data consistency?

**A:** "Several approaches:

**1. Atomic Updates:**
```javascript
// When adding comment, increment count atomically
await post.save()  // Mongoose handles atomicity
```

**2. Cleanup on Delete:**
```javascript
// When deleting post, also delete related data
await Post.findByIdAndDelete(postId)
await Like.deleteMany({ post: postId })
await Comment.deleteMany({ post: postId })
```

**3. Transactions (for critical operations):**
```javascript
const session = await mongoose.startSession()
session.startTransaction()
try {
  // Multiple operations
  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
}
```

**4. Schema Validation:**
- Required fields enforced by Mongoose
- Unique indexes on email/username
- Ref validation for ObjectIds

**Potential Issues:**
- Count denormalization can get out of sync
- Solution: Could add periodic reconciliation job
- Or use MongoDB transactions for updates"

---

## Authentication & Security

### Q: How did you secure your application?

**A:** "Multiple security layers:

**1. Password Security:**
- Bcrypt hashing with salt rounds: 10
- Passwords never stored in plain text
- Never returned in API responses (`.select('-password')`)

**2. JWT Security:**
- Short-lived access tokens (15min)
- Refresh tokens with longer expiry (7days)
- Tokens include minimal data (only user ID)
- Signed with secret keys from environment variables

**3. CORS Configuration:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://backend-projects-kappa.vercel.app'
  ],
  credentials: true,
  methods: 'GET,POST,PUT,DELETE'
}))
```

**4. Input Validation:**
- Email format validation
- Password strength (min 8 characters)
- Username format (alphanumeric + underscore)
- ObjectId validation to prevent injection
- Sanitization to prevent XSS

**5. Environment Variables:**
- All secrets in `.env` (never committed to Git)
- Different configs for dev/prod
- API keys, database URIs, JWT secrets all protected

**6. HTTP Headers:**
- `httpOnly` cookies (not accessible via JavaScript)
- `secure` flag for HTTPS only
- `sameSite: 'None'` for cross-origin

**7. Authorization Checks:**
```javascript
// Ownership verification
if (post.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, \"Forbidden\")
}
```

**8. Rate Limiting (Future Enhancement):**
- Could add express-rate-limit
- Prevent brute force attacks
- Limit API calls per user/IP"

### Q: What about SQL injection or NoSQL injection?

**A:** "MongoDB with Mongoose provides protection:

**1. Parameterized Queries:**
```javascript
// Safe - Mongoose escapes values
User.findOne({ email: userInput })

// Unsafe (never do this)
User.findOne({ $where: userInput })
```

**2. Input Validation:**
- Validate all inputs before queries
- Reject suspicious characters
- Use strict schemas

**3. NoSQL Injection Example:**
Attacker sends: `{ \"email\": { \"$ne\": null } }`
This would match all users!

**Prevention:**
```javascript
// Validate email format
if (!isValidEmail(email)) {
  throw new ApiError(400, 'Invalid email')
}

// Mongoose automatically handles this
// But we add extra validation layer
```

**4. Schema Enforcement:**
- Mongoose schemas reject unexpected fields
- Type validation built-in
- Required fields enforced"

---

## Challenges & Solutions

### Q: What challenges did you face during development?

**A:** "Several significant challenges:

**1. Challenge: CORS Issues in Production**

**Problem:**
- Login worked but other APIs failed with 401
- Cookies weren't being sent cross-origin
- Origin was showing as `null` in logs

**Root Cause:**
- Cookies with `SameSite=None` weren't working
- Browsers don't send cookies when origin is null
- Frontend wasn't sending Authorization header

**Solution:**
- Moved from cookie-based auth to header-based
- Store tokens in localStorage
- Added Axios request interceptor to attach Authorization header
- Implemented automatic token refresh on 401

**Code:**
```javascript
// Axios interceptor automatically adds token
config.headers.Authorization = `Bearer ${token}`
```

**Lesson Learned:** For cross-origin SPAs, header-based auth is more reliable than cookies.

---

**2. Challenge: Inconsistent Error Handling**

**Problem:**
- Different error formats from different endpoints
- Users seeing technical errors like \"CastError\"
- No field-level validation errors
- Debugging difficult without structured errors

**Solution:**
- Created global error handler middleware
- Custom ApiError class with `isOperational` flag
- Validation utilities for common checks
- Environment-aware error responses (dev vs prod)

**Implementation:**
```javascript
// Handles all error types automatically
- Mongoose ValidationError → 400 with fields
- MongoDB Duplicate Key → 409
- Invalid ObjectId → 400
- JWT errors → 401
```

**Lesson Learned:** Global error handling saves time and improves UX significantly.

---

**3. Challenge: N+1 Query Problem in Feed**

**Problem:**
- Fetching posts: 1 query
- For each post, fetching user: N queries
- Total: N+1 queries for feed with N posts
- Performance degraded as posts increased

**Solution:**
- Used MongoDB aggregation pipeline
- `$lookup` to join users in single query
- Pagination to limit results

**Before:**
```javascript
const posts = await Post.find()
// Then for each post
const user = await User.findById(post.owner)  // N queries!
```

**After:**
```javascript
Post.aggregate([
  { $lookup: { from: 'users', localField: 'owner', ... } }
])  // Single query!
```

**Lesson Learned:** Aggregation pipelines are powerful for joins in MongoDB.

---

**4. Challenge: File Upload to Cloudinary Failing**

**Problem:**
- Images uploaded locally but Cloudinary upload timing out
- Error: \"ECONNRESET\"
- Worked in localhost, failed in production

**Root Cause:**
- Railway deployment had strict Network timeout
- Large images taking too long
- Temp folder permissions issue

**Solution:**
- Created temp folder programmatically with proper permissions
- Added retry logic for Cloudinary uploads
- Validated file size before upload (max 5MB)
- Set timeout configuration in Cloudinary SDK

**Code:**
```javascript
if (!fs.existsSync('./public/temp')) {
  fs.mkdirSync('./public/temp', { recursive: true })
}
```

**Lesson Learned:** Always handle filesystem operations explicitly in cloud environments.

---

**5. Challenge: Token Refresh Race Condition**

**Problem:**
- Multiple API calls happening simultaneously
- All getting 401 when access token expired
- All trying to refresh token at same time
- Creating multiple refresh requests

**Solution:**
- Implement token refresh with Promise caching
- If refresh is in progress, queue subsequent requests
- Only one refresh request at a time

**Pseudo-code:**
```javascript
let refreshTokenPromise = null

if (error.status === 401) {
  if (!refreshTokenPromise) {
    refreshTokenPromise = refreshTokenAPI()
  }
  const newToken = await refreshTokenPromise
  refreshTokenPromise = null
  // Retry all queued requests
}
```

**Current Status:** Basic implementation done, advanced queueing can be added.

**Lesson Learned:** Concurrent async operations need careful handling.

---

**6. Challenge: MongoDB Connection Pooling**

**Problem:**
- App occasionally crashing with \"too many connections\"
- Especially under load or during development restarts

**Solution:**
- Configured proper connection pooling
- Added connection event listeners
- Graceful shutdown on app restart

**Code:**
```javascript
mongoose.connect(URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})
```

**Lesson Learned:** Always configure database connections properly for production."

### Q: What would you improve if you had more time?

**A:** "Several enhancements I'd add:

**1. Testing:**
- Unit tests for utilities and controllers
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage reports

**2. Real-time Features:**
- WebSocket for notifications
- Live feed updates
- Real-time comment updates
- Online status indicators

**3. Performance:**
- Redis caching for frequently accessed data
- Image lazy loading
- Infinite scroll optimization
- CDN for static assets

**4. Features:**
- Search functionality (posts, users)
- Hashtags and trending topics
- Direct messaging
- User mentions and tagging
- Email notifications
- Password reset flow

**5. Monitoring:**
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Analytics (user behavior)
- Logging service (Winston + CloudWatch)

**6. DevOps:**
- CI/CD pipeline (GitHub Actions)
- Automated testing on PR
- Docker containerization
- Kubernetes for scaling
- Database backups

**7. Security:**
- Rate limiting
- 2FA authentication
- Content moderation
- Spam detection
- GDPRCOMPLIANCE"

---

## Deployment & DevOps

### Q: How did you deploy your application?

**A:" "Separate deployments for frontend and backend:

**Backend (Railway):**
1. Connected GitHub repository
2. Railway auto-detects Node.js
3. Set environment variables in dashboard
4. Configured build command: `npm install`
5. Start command: `npm start` (runs `node src/index.js`)
6. Automatic deployments on git push

**Frontend (Vercel):**
1. Connected GitHub repository
2. Detected Vite project automatically
3. Set environment variable: `VITE_API_BASE_URL=https://backend.railway.app/api/v1`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Automatic deployments on push to main branch

**Environment Variables:**

Backend (.env):
```
MONGODB_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ORIGIN=https://frontend.vercel.app
NODE_ENV=production
PORT=8000
```

Frontend (.env):
```
VITE_API_BASE_URL=https://backend.railway.app/api/v1
```

**Benefits of this setup:**
- Zero-downtime deployments
- Automatic SSL certificates
- CDN for frontend assets
- Easy rollbacks
- Preview deployments for PRs"

---

## Performance & Optimization

### Q: How did you optimize your application?

**A:** "Several optimizations:

**Backend:**

**1. Database Indexing:**
```javascript
// Indexes on frequently queried fields
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
postSchema.index({ createdAt: -1 })  // For feed sorting
```

**2. Pagination:**
- Limit results per request (10-20 posts)
- Prevents large data transfers
- Better UX with infinite scroll

**3. Aggregation over Multiple Queries:**
- Single query with $lookup instead of N+1
- Reduces database round trips

**4. Lean Queries:**
```javascript
// Don't need full Mongoose document
User.findById(id).select('username avatar').lean()
```

**5. Cloudinary Optimizations:**
- Automatic image compression
- CDN delivery
- Lazy loading URLs

**Frontend:**

**1. Code Splitting:**
- Vite automatically splits code
- Lazy load routes

**2. Debouncing:**
- Search input debounced (300ms)
- Reduces API calls

**3. Image Optimization:**
- Use Cloudinary transformations
- Responsive images
- Lazy loading"

---

## Closing Tips

**Demo Flow:**
1. Start with user registration
2. Show login and token storage
3. Create a post with image
4. Like/comment on posts
5. Show feed with pagination
6. Demonstrate error handling

**Good luck! 🚀**
