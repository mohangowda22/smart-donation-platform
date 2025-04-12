const Donation = require('../models/donationModel');
const Campaign = require('../models/campaignModel');

exports.donateToCampaign = async (req, res) => {
    try {
        const { campaignId, amount } = req.body;

        // Find the campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Check if the target is already achieved
        if (campaign.currentAmount >= campaign.targetAmount) {
            return res.status(400).json({ message: 'Target already achieved. Donations are no longer accepted.' });
        }

        // Check if the donation exceeds the target
        if (campaign.currentAmount + amount > campaign.targetAmount) {
            return res.status(400).json({ message: 'Donation exceeds the target amount.' });
        }

        // Create a new donation
        const donation = new Donation({
            amount,
            donor: req.user.id,
            campaign: campaignId,
        });

        await donation.save();

        // Update campaign's current amount
        campaign.currentAmount += amount;
        await campaign.save();

        // Emit real-time update via WebSocket
        const io = req.app.get('io');
        if (io) {
            // Emit the update to all connected donors
            io.to('donors').emit('donationUpdate', {
                _id: campaign._id, // Use _id instead of campaignId
                currentAmount: campaign.currentAmount,
            });
        }

        res.status(200).json({ message: 'Donation successful', donation });
    } catch (error) {
        console.error('Error processing donation:', error);
        res.status(500).json({ message: 'Error processing donation', error });
    }
};

exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.aggregate([
            {
                $group: {
                    _id: "$campaign", // Group by campaign ID
                    totalAmount: { $sum: "$amount" }, // Sum the donation amounts
                    donations: { $push: "$$ROOT" } // Include all donation details
                }
            },
            {
                $lookup: {
                    from: "campaigns", // Reference the Campaign collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "campaignDetails"
                }
            },
            {
                $unwind: "$campaignDetails" // Unwind the campaign details array
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    campaignId: "$campaignDetails._id",
                    campaignTitle: "$campaignDetails.title",
                    totalAmount: 1,
                    donations: {
                        donor: 1,
                        amount: 1,
                        donatedAt: 1
                    }
                }
            }
        ]);

        res.status(200).json({ donations });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Error fetching donations', error });
    }
};