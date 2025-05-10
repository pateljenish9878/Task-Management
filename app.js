const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const connectDB = require('./config/database');

const { attachUser } = require('./middleware/auth');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/tasks.routes');
const categoryRoutes = require('./routes/categories.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'task-management-app',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' 
  }
}));
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(attachUser);

app.use('/', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
  if (res.locals.user) {
    return res.redirect('/tasks');
  }
  res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
  if (res.locals.user) {
    return res.redirect('/tasks?error=Page not found');
  }
  res.redirect('/login');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (res.locals.user) {
    return res.redirect('/tasks?error=Something went wrong');
  }
  res.redirect('/login');
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = app; 