import React, { useState } from 'react';
import { donateToCampaign } from '../utils/api';

interface DonationFormProps {
  campaignId: string;
  currentAmount: number;
  targetAmount: number;
}

const DonationForm: React.FC<DonationFormProps> = ({ campaignId, currentAmount, targetAmount }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const donationAmount = parseFloat(amount);
      await donateToCampaign(campaignId, donationAmount);
      setAmount(''); // Clear the input field
    } catch (error: any) {
      alert(error.message || 'Failed to donate. Please try again.');
    }
  };

  const isTargetAchieved = currentAmount >= targetAmount;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        disabled={isTargetAchieved} // Disable input if target is achieved
      />
      <button type="submit" disabled={isTargetAchieved}>
        Donate
      </button>
    </form>
  );
};

export default DonationForm;