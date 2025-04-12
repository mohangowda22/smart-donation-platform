import React, { useState } from 'react';
import { createCampaign } from '../utils/api';
import './../styles/CreateCampaign.css'; // Import your CSS file for styling

interface CreateCampaignProps {
  refreshCampaigns: () => void; // Callback to refresh the campaigns list
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({ refreshCampaigns }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign({ title, description, targetAmount: parseFloat(targetAmount) });
      alert('Campaign created successfully!');
      refreshCampaigns(); // Refresh the campaigns list
      setTitle(''); // Clear the form
      setDescription('');
      setTargetAmount('');
    } catch (err) {
      alert('Failed to create campaign');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-campaign-form">
      <h2>Create Campaign</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Target Amount"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
      />
      <button type="submit">Create Campaign</button>
    </form>
  );
};

export default CreateCampaign;