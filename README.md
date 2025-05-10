## Admin Credential(admin is fixed one)

```
email : pateljenish2021@gmail.com
password : 1234567
```

## API Routes

### Authentication
- `GET /login` - Render login page
- `POST /login` - Process login
- `GET /register` - Render registration page
- `POST /register` - Process registration
- `GET /logout` - Log out user
- `GET /forgot-password` - Render forgot password page
- `POST /forgot-password` - Process forgot password request
- `GET /reset-password` - Render reset password page with OTP verification
- `POST /reset-password` - Process password reset

### Profile Management
- `GET /profile` - View user profile
- `GET /profile/edit` - Render profile edit form
- `POST /profile/edit` - Update user profile
- `GET /profile/change-password` - Render change password form
- `POST /profile/change-password` - Process password change
- `POST /profile/upload-image` - Upload profile image

### Tasks
- `GET /tasks` - View all tasks (filtered by user)
- `GET /tasks/create` - Render task creation form
- `POST /tasks/create` - Create new task
- `GET /tasks/edit/:id` - Render task edit form
- `POST /tasks/edit/:id` - Update task
- `GET /tasks/delete/:id` - Delete task

### Categories
- `GET /categories` - View all categories (filtered by user)
- `GET /categories/create` - Render category creation form
- `POST /categories/create` - Create new category
- `GET /categories/edit/:id` - Render category edit form
- `POST /categories/edit/:id` - Update category
- `GET /categories/delete/:id` - Delete category