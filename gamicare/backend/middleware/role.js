const role = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            const currentRole = req.user.role || 'NONE';
            const currentUrl = req.originalUrl;
            const logEntry = `[${new Date().toISOString()}] URL: ${currentUrl} | Role: ${currentRole} | Required: ${allowedRoles.join(',')}\n`;
            
            try {
                const fs = require('fs');
                const path = require('path');
                fs.appendFileSync(path.join(__dirname, '../debug_log.txt'), logEntry);
            } catch (err) {
                // Ignore log errors
            }

            return res.status(403).json({ 
                message: `Not authorized for this role: [${currentRole}] on [${currentUrl}]. Required: [${allowedRoles.join(',')}]` 
            });
        }
        
        next();
    };
};

module.exports = role;