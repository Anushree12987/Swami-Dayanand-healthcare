const Department = require('../models/Department');
const User = require('../models/User');

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

// Add new department
exports.addDepartment = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        
        const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = new Department({
            name,
            description,
            icon: icon || 'FaHospital'
        });

        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: 'Error adding department', error: error.message });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const { name, description, icon, isActive } = req.body;
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        if (name) department.name = name;
        if (description !== undefined) department.description = description;
        if (icon) department.icon = icon;
        if (isActive !== undefined) department.isActive = isActive;
        
        department.updatedAt = Date.now();
        await department.save();

        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Error updating department', error: error.message });
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if any doctors are assigned to this department
        const doctorsInDept = await User.countDocuments({ 
            role: 'doctor', 
            specialization: department.name 
        });

        if (doctorsInDept > 0) {
            return res.status(400).json({ 
                message: `Cannot delete department because ${doctorsInDept} doctors are assigned to it.` 
            });
        }

        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
};

// Toggle department status
exports.toggleStatus = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        department.isActive = !department.isActive;
        await department.save();

        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling status', error: error.message });
    }
};
