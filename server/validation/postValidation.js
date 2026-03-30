import Joi from 'joi';

export const createPostValidation = (data) => {
    const schema = Joi.object({
        postType: Joi.string().valid('tutor', 'material', 'both').required(),
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(2000).required(),
        subject: Joi.string().min(2).max(50).required(),
        gradeLevel: Joi.string().max(50).optional(),
        location: Joi.string().required(),
        chatFee: Joi.when('postType', {
            is: Joi.string().valid('tutor', 'both'),
            then: Joi.number().min(1).max(30).required(),
            otherwise: Joi.optional()
        }),
        materialPrice: Joi.when('postType', {
            is: Joi.string().valid('material', 'both'),
            then: Joi.number().min(1).required(),
            otherwise: Joi.optional()
        }),
        durationDays: Joi.number().integer().min(5).required()
    });
    return schema.validate(data);
};

export const getPostsValidation = (data) => {
    const schema = Joi.object({
        postType: Joi.string().valid('tutor', 'material', 'both').optional(),
        subject: Joi.string().max(50).optional(),
        gradeLevel: Joi.string().max(50).optional(),
        search: Joi.string().max(100).optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(10),
        sort: Joi.string().valid('newest', 'oldest').default('newest')
    });
    return schema.validate(data);
};