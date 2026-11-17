'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCampaignStore } from '@/stores/campaignStore';

export default function CampaignList() {
  const { apiKey } = useAuthStore();
  const { campaigns, loading, error, fetchCampaigns } = useCampaignStore();

  useEffect(() => {
    if (apiKey) {
      fetchCampaigns(apiKey);
    }
  }, [apiKey, fetchCampaigns]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error loading campaigns: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Campaign History</h2>
      
      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No campaigns yet. Create your first campaign above!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {campaign.message}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.target.platform || 'All'}
                    {campaign.target.lastLoginDays && ` (${campaign.target.lastLoginDays}d)`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(campaign.sendAt.toString())}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>Sent: {campaign.sentCount || 0}</span>
                      <span>Clicked: {campaign.clickedCount || 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}