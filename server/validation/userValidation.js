import Joi from 'joi';

export const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required().lowercase(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        educationLevel: Joi.string().max(50).optional(),
        bio: Joi.string().max(200).optional()
    });
    return schema.validate(data);
};

export const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
};

export const updateProfileValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        profilePicture: Joi.string().uri().optional(),
        bio: Joi.string().max(200).optional(),
        educationLevel: Joi.string().max(50).optional()
    });
    return schema.validate(data);
};

export const changePasswordValidation = (data) => {
    const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
        confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    });
    return schema.validate(data);
};