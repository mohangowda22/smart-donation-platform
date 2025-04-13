const express = require('express');
const { donateToCampaign, getAllDonations } = require('../controllers/donationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/donations/donate:
 *   post:
 *     summary: Donate to a campaign
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Donation successful
 *       404:
 *         description: Campaign not found
 *       401:
 *         description: Unauthorized
 */
router.post('/donate', authMiddleware('donor'), donateToCampaign);

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donations (Admin only)
 *     tags:
 *       - Donations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all donations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       donor:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                       campaign:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                       donatedAt:
 *                         type: string
 *                         format: date-time
 *     401:
 *       description: Unauthorized
 */
router.get('/', authMiddleware('admin'), getAllDonations);

module.exports = router;