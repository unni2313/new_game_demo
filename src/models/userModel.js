/**
 * User Structure
 * This defines the shape of a User object in our application.
 */
export const UserModel = (data) => {
    return {
        name: data.name,
        email: data.email,
        age: data.age ? Number(data.age) : null,
        password: data.password,
        role: data.role || 'user',
        team: data.team || null,
        createdAt: new Date(),
        // Add any other default fields here
    };
};
