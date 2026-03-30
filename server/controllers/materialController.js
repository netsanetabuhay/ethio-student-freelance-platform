import {
    unlockMaterialValidation,
    purchaseMaterialValidation,
    downloadMaterialValidation
} from '../validation/materialValidation.js';
import {
    unlockMaterial,
    purchaseMaterial,
    getDownloadUrl,
    checkMaterialUnlock,
    hasPurchasedMaterial
} from '../services/materialService.js';
import { checkPostExpiry } from '../middleware/checkPostExpiry.js';

export const unlock = async (req, res) => {
    try {
        const data = req.body;
        
        const { error } = unlockMaterialValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { postId } = data;
        
        await checkPostExpiry(postId);
        
        const result = await unlockMaterial(req.user.id, postId);
        
        res.json({
            success: true,
            data: result,
            message: 'Material unlocked successfully! You can now chat with the seller and purchase the material.'
        });
    } catch (error) {
        console.error('Unlock material error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const purchase = async (req, res) => {
    try {
        const data = req.body;
        
        const { error } = purchaseMaterialValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { postId } = data;
        
        await checkPostExpiry(postId);
        
        const purchase = await purchaseMaterial(req.user.id, postId);
        
        res.json({
            success: true,
            data: purchase,
            message: 'Material purchased successfully! You can now download it.'
        });
    } catch (error) {
        console.error('Purchase material error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const download = async (req, res) => {
    try {
        const { purchaseId } = req.params;
        
        const fileUrl = await getDownloadUrl(purchaseId, req.user.id);
        
        res.json({
            success: true,
            data: { downloadUrl: fileUrl },
            message: 'Download ready'
        });
    } catch (error) {
        console.error('Download material error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const checkUnlockStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const isUnlocked = await checkMaterialUnlock(postId, req.user.id);
        const hasPurchased = await hasPurchasedMaterial(postId, req.user.id);
        
        res.json({
            success: true,
            data: {
                isUnlocked,
                hasPurchased,
                canPurchase: isUnlocked && !hasPurchased
            }
        });
    } catch (error) {
        console.error('Check unlock status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};