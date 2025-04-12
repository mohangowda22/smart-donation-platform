const Donation = require('../models/donationModel');
const Campaign = require('../models/campaignModel');
const logger = require('../utils/logger');

exports.donateToCampaign = async (req, res) => {
    try {
        const { campaignId, amount } = req.body;

        // Log the donation attempt
        logger.info(`Donation attempt by user ${req.user.id} for campaign ${campaignId} with amount ${amount}`);

        // Find the campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            logger.warn(`Campaign not found: ${campaignId}`);
            return res.status(404).json({ message: 'Campaign not found' });
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

        // Prepare the data to emit
        const emittedData = {
            campaignId: campaign._id,
            campaignTitle: campaign.title,
            currentAmount: campaign.currentAmount,
            donation: {
                donor: req.user.id,
                amount,
                donatedAt: new Date(),
            },
        };

        // Emit real-time update via WebSocket
        const io = req.app.get('io'); // Access the Socket.IO instance
        io.emit('donationUpdate', emittedData);

        // Log emitted data to the console
        console.log('Emitted Data:', emittedData);

        // Optionally, log emitted data to a database (if required)
        // Example: Save emitted data to a separate collection
        // const DonationLog = require('../models/donationLogModel'); // Create a model for logging
        // const logEntry = new DonationLog(emittedData);
        // await logEntry.save();

        logger.info(`Donation successful: User ${req.user.id} donated ${amount} to campaign ${campaignId}`);

        res.status(200).json({ message: 'Donation successful', donation });
    } catch (error) {
        logger.error('Error processing donation:', error);
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