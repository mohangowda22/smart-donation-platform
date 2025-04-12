const express = require('express');
const { createCampaign, getAllCampaigns } = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/campaigns/create:
 *   post:
 *     summary: Create a new campaign (Admin only)
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/create', authMiddleware('admin'), createCampaign);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all active campaigns
 *     tags:
 *       - Campaigns
 *     responses:
 *       200:
 *         description: List of all active campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       targetAmount:
 *                         type: number
 *                       currentAmount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *     500:
 *       description: Error fetching campaigns
 */
router.get('/', authMiddleware(), getAllCampaigns);

module.exports = router;