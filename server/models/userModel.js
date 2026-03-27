// This is NOT schema enforcement, just a structure guide

const createUser = ({
    username,
    email,
    firstname,
    lastname,
    password,
    skill,
    role
}) => {
    return {
        username,
        email,
        firstname,
        lastname,
        password,
        skill,
        role,
        createdAt: new Date()
    };
};

module.exports = { createUser };