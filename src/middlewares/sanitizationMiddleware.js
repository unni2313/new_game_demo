/**
 * Middleware to sanitize incoming request data against NoSQL injection
 * This replaces special MongoDB operators (keys starting with $) to prevent injection attacks.
 * Designed to be compatible with Express 5's read-only properties.
 */
export const mongoSanitize = (req, res, next) => {
    const sanitize = (obj) => {
        if (obj instanceof Object) {
            for (const key in obj) {
                if (key.startsWith('$')) {
                    delete obj[key];
                } else if (obj[key] instanceof Object) {
                    sanitize(obj[key]);
                }
            }
        }
        return obj;
    };

    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    // Note: In Express 5, we avoid touching req.query directly as it's a getter

    next();
};
