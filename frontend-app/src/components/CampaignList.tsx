import React from 'react';
import DonationForm from './DonationForm';
import Thermometer from './Thermometer'; // Import the reusable thermometer component
import './../styles/CampaignList.css'; // Import campaign-specific styles

interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
}

interface CampaignListProps {
  campaigns: Campaign[];
  isAdmin: boolean;
  refreshCampaigns: () => void; // Callback to refresh campaigns
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, isAdmin, refreshCampaigns }) => {
  return (
    <div className="campaign-list">
      <h2 className="campaign-list-title">Campaigns</h2>
      <ul className="campaign-list-grid">
        {campaigns.map((campaign) => (
          <li key={campaign._id} className="campaign-card">
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p className="campaign-target">
              Target: ${campaign.targetAmount.toLocaleString()}
            </p>
            <p className="campaign-current">
              Current: ${campaign.currentAmount.toLocaleString()}
            </p>
            {/* Use the reusable Thermometer component */}
            <Thermometer
              currentAmount={campaign.currentAmount}
              targetAmount={campaign.targetAmount}
            />
            {!isAdmin && (
              <DonationForm
                campaignId={campaign._id}
                currentAmount={campaign.currentAmount}
                targetAmount={campaign.targetAmount}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignList;