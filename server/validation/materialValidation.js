import Joi from 'joi';

export const unlockMaterialValidation = (data) => {
    const schema = Joi.object({
        postId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    });
    return schema.validate(data);
};

export const purchaseMaterialValidation = (data) => {
    const schema = Joi.object({
        postId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    });
    return schema.validate(data);
};

export const downloadMaterialValidation = (data) => {
    const schema = Joi.object({
        purchaseId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    });
    return schema.validate(data);
};