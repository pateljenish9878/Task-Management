const Task = require('../models/Task');
const Category = require('../models/Category');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const { showAll, category, status, priority, userId: filterUserId } = req.query;
    
    let filterQuery = {};
    
    if (userRole === 'admin' && showAll === 'true') {
      if (filterUserId) {
        filterQuery.user = filterUserId;
      }
    } else {
      filterQuery.user = userId;
    }
    
    if (category) {
      filterQuery.category = category;
    }
    
    if (status) {
      filterQuery.status = status;
    }
    
    if (priority) {
      filterQuery.priority = priority;
    }
    
    let tasks = await Task.find(filterQuery)
      .populate('user', 'username')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    let users = [];
    if (userRole === 'admin') {
      users = await User.find().select('username _id');
    }
    
    const categories = await Category.find({ 
      $or: [
        { createdBy: userId },
        { createdBy: { $exists: false } }
      ]
    });
    
    res.render('taskList', {
      title: 'Tasks',
      tasks,
      categories,
      users,
      isAdmin: userRole === 'admin',
      showAll: showAll === 'true',
      categoryId: category || '',
      status: status || '',
      priority: priority || '',
      userId: filterUserId || '',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.redirect('/tasks?error=Error loading tasks');
  }
};

exports.getCreateTaskForm = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const categories = await Category.find({ 
      $or: [
        { createdBy: userId },
        { createdBy: { $exists: false } }
      ]
    });
    
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find().select('username _id');
    }
    
    res.render('taskForm', {
      title: 'Create Task',
      task: null,
      categories,
      users,
      isAdmin: req.user.role === 'admin',
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error rendering task form:', error);
    res.redirect('/tasks?error=Error loading task form');
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, category } = req.body;
    
    let userId = req.user.id;
    if (req.user.role === 'admin' && req.body.userId) {
      userId = req.body.userId;
    }
    
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      category: category || undefined,
      user: userId
    });
    
    await task.save();
    
    res.redirect('/tasks?success=Task created successfully');
  } catch (error) {
    console.error('Error creating task:', error);
    res.redirect('/tasks/create?error=Error creating task');
  }
};

exports.getEditTaskForm = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.redirect('/tasks?error=Task not found');
    }
    const categories = await Category.find();
    
    let users = [];
    if (userRole === 'admin') {
      users = await User.find().select('username _id');
    }
    
    res.render('taskForm', {
      title: 'Edit Task',
      task,
      categories,
      users,
      isAdmin: userRole === 'admin',
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error rendering edit task form:', error);
    res.redirect('/tasks?error=Error loading task form');
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.redirect('/tasks?error=Task not found');
    }
    
    const { title, description, status, priority, dueDate, category } = req.body;
    
    task.title = title;
    task.description = description;
    task.status = status;
    task.priority = priority;
    task.dueDate = dueDate || undefined;
    task.category = category || undefined;
    
    if (userRole === 'admin' && req.body.userId) {
      task.user = req.body.userId;
    }
    
    await task.save();
    
    res.redirect('/tasks?success=Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
    res.redirect(`/tasks/edit/${req.params.id}?error=Error updating task`);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.redirect('/tasks?error=Task not found');
    }
    
    await Task.findByIdAndDelete(taskId);
    
    res.redirect('/tasks?success=Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    res.redirect('/tasks?error=Error deleting task');
  }
}; 