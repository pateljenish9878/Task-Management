const Category = require('../models/Category');
const Task = require('../models/Task');

exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let categories;
    
    if (userRole === 'admin' && req.query.showAll === 'true') {
      categories = await Category.find()
        .populate('createdBy', 'username')
        .sort({ name: 1 });
    } else {
      categories = await Category.find({ createdBy: userId })
        .sort({ name: 1 });
    }
    
    const categoryIds = categories.map(category => category._id);
    const taskCounts = await Task.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const taskCountMap = {};
    taskCounts.forEach(item => {
      taskCountMap[item._id.toString()] = item.count;
    });
    
    const categoriesWithTaskCounts = categories.map(category => {
      const categoryObj = category.toObject();
      categoryObj.taskCount = taskCountMap[category._id.toString()] || 0;
      return categoryObj;
    });
    
    res.render('categoryList', {
      title: 'Categories',
      categories: categoriesWithTaskCounts,
      isAdmin: userRole === 'admin',
      showAll: req.query.showAll === 'true',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.redirect('/categories?error=Error loading categories');
  }
};

exports.getCreateCategoryForm = (req, res) => {
  res.render('categoryForm', {
    title: 'Create Category',
    category: null,
    error: req.query.error || null
  });
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = new Category({
      name,
      description,
      createdBy: req.user.id
    });
    
    await category.save();
    
    res.redirect('/categories?success=Category created successfully');
  } catch (error) {
    console.error('Error creating category:', error);
    res.redirect('/categories/create?error=Error creating category');
  }
};

exports.getEditCategoryForm = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.redirect('/categories?error=Category not found');
    }
    res.render('categoryForm', {
      title: 'Edit Category',
      category,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error rendering edit category form:', error);
    res.redirect('/categories?error=Error loading category');
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.redirect('/categories?error=Category not found');
    }
    
    const { name, description } = req.body;
    
    category.name = name;
    category.description = description;
    
    await category.save();
    
    res.redirect('/categories?success=Category updated successfully');
  } catch (error) {
    console.error('Error updating category:', error);
    res.redirect('/categories?error=Error updating category');
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.redirect('/categories?error=Category not found');
    }
    
    const tasksWithCategory = await Task.countDocuments({ category: categoryId });
    
    if (tasksWithCategory > 0) {
      return res.redirect('/categories?error=Cannot delete category that has active tasks. Please delete or reassign all tasks first.');
    }
    
    await Category.findByIdAndDelete(categoryId);
    
    res.redirect('/categories?success=Category deleted successfully');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.redirect('/categories?error=Error deleting category');
  }
}; 