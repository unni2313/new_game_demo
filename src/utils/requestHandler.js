export const requestHandler = (fn) => {
    return (req, res, next) => {
        // fn(req, res, next) might be async, so we wrap it in Promise.resolve to be safe
        // though typically it returns a Promise if it's async
        Promise.resolve(fn(req, res, next))
            .then((result) => {
                // If the controller returns nothing (undefined/null), 
                // it might have sent the response itself (e.g., streaming file), so we safeguard.
                if (!result) return;

                // Destructure the expected return format
                const { statusCode = 200, message = 'Success', data } = result;

                // Send the standardized response
                res.status(statusCode).json({
                    status: 'success',
                    message,
                    data
                });
            })
            .catch(next); // Errors still flow to the global error handler
    };
};
