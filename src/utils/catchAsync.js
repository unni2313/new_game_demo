/**
 * Wraps an async function to automatically catch errors
 * and pass them to the next middleware (error handler).
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
