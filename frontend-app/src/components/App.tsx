import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logout } from '../store/store';
import CampaignList from './CampaignList';
import CreateCampaign from './CreateCampaign';
import Login from './Login';
import { fetchCampaigns, refreshCampaigns } from '../utils/api';
import { io } from 'socket.io-client';
import './../styles/App.css';


interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
}

const App: React.FC = () => {
  const { token, isAdmin } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [socket, setSocket] = useState<any>(null);

  console.log('Redux State:', { token, isAdmin }); // Debugging

  const fetchAndSetCampaigns = async () => {
    const fetchedCampaigns = await refreshCampaigns();
    setCampaigns(fetchedCampaigns); // Update the state with the fetched campaigns
  };

  const handleUpdateCampaign = (campaignId: string, amount: number) => {
    console.log(`Updating campaign ${campaignId} with amount ${amount}`);
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign._id === campaignId
          ? { ...campaign, currentAmount: campaign.currentAmount + amount }
          : campaign
      )
    );
  };

  useEffect(() => {
    if (token) {
      fetchAndSetCampaigns();

      // Establish WebSocket connection
      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: {
          token: token, // Replace with the actual token
        },
      });
      setSocket(newSocket);

      // Listen for donation updates
      const handleDonationUpdate = (updatedCampaign: any) => {
        console.log('Real-time update received:', updatedCampaign);

        if (!updatedCampaign._id || updatedCampaign.currentAmount === undefined) {
          console.warn('Invalid campaign data received:', updatedCampaign);
          return;
        }

        setCampaigns((prevCampaigns) => {
          const existingCampaign = prevCampaigns.find(
            (campaign) => campaign._id === updatedCampaign._id
          );
          if (existingCampaign) {
            return prevCampaigns.map((campaign) =>
              campaign._id === updatedCampaign._id
                ? { ...campaign, currentAmount: updatedCampaign.currentAmount }
                : campaign
            );
          } else {
            return [...prevCampaigns, updatedCampaign];
          }
        });
      };

      newSocket.on('donationUpdate', handleDonationUpdate);

      // Cleanup on component unmount
      return () => {
        newSocket.off('donationUpdate', handleDonationUpdate); // Remove the specific listener
        newSocket.disconnect(); // Disconnect the WebSocket
      };
    }
  }, [token]);

  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state
    if (socket) {
      socket.disconnect(); // Disconnect WebSocket on logout
    }
  };

  if (!token) {
    return <Login onLogin={() => fetchAndSetCampaigns()} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="font-heading text-3xl">Smart Donation Platform</h1>
        <button onClick={handleLogout} className="logout-button font-sans">
          Logout
        </button>
      </header>
      <main className="app-main">
        {isAdmin && <CreateCampaign refreshCampaigns={fetchAndSetCampaigns} />}
        <CampaignList
          isAdmin={isAdmin}
          campaigns={campaigns}
          refreshCampaigns={fetchAndSetCampaigns}
        />
      </main>
    </div>
  );
};

export default App;