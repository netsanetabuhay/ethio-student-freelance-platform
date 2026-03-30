import Joi from 'joi';

export const buyCoinsValidation = (data) => {
    const schema = Joi.object({
        coinAmount: Joi.number().integer().min(1).required(),
        amountPaid: Joi.number().min(1).required(),
        paymentMethod: Joi.string().min(2).max(50).required(),
        accountDetails: Joi.string().min(3).max(100).required(),
        transactionId: Joi.string().min(3).max(100).required()
    });
    return schema.validate(data);
};

export const verifyCoinPurchaseValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid('verified', 'rejected').required(),
        transactionId: Joi.when('status', {
            is: 'verified',
            then: Joi.string().min(3).required(),
            otherwise: Joi.optional()
        })
    });
    return schema.validate(data);
};

export const getPurchasesValidation = (data) => {
    const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(20)
    });
    return schema.validate(data);
};