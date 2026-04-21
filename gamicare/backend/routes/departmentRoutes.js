const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All department routes are protected and admin-only
router.use(auth);
router.use(role('admin'));

router.get('/', departmentController.getAllDepartments);
router.post('/', departmentController.addDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);
router.patch('/:id/toggle-status', departmentController.toggleStatus);

module.exports = router;
