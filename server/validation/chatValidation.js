import Joi from 'joi';

export const startChatValidation = (data) => {
    const schema = Joi.object({
        postId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    });
    return schema.validate(data);
};

export const sendMessageValidation = (data) => {
    const schema = Joi.object({
        message: Joi.string().min(1).max(1000).required()
    });
    return schema.validate(data);
};

export const getMessagesValidation = (data) => {
    const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50)
    });
    return schema.validate(data);
};