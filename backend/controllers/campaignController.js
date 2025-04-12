const Campaign = require('../models/campaignModel');

exports.createCampaign = async (req, res) => {
    try {
        const { title, description, targetAmount } = req.body;

        const campaign = new Campaign({
            title,
            description,
            targetAmount,
            createdBy: req.user.id,
        });

        await campaign.save();
        res.status(201).json({ message: 'Campaign created successfully', campaign });
    } catch (error) {
        res.status(500).json({ message: 'Error creating campaign', error });
    }
};

exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ isActive: true }); // Fetch only active campaigns
        res.status(200).json({ campaigns });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Error fetching campaigns', error });
    }
};