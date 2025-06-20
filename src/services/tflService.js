// TFL API service for direct calls to Transport for London API
const TFL_API_BASE_URL = 'https://api.tfl.gov.uk';

export const tflService = {
  // Fetch status for all tube lines
  async getTubeStatus() {
    try {
      const response = await fetch(`${TFL_API_BASE_URL}/line/mode/tube/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data to a simpler format
      const lineStatuses = data.map(line => ({
        id: line.id,
        name: line.name,
        status: line.lineStatuses?.[0]?.statusSeverityDescription || 'Unknown',
        statusSeverity: line.lineStatuses?.[0]?.statusSeverity || 0,
        reason: line.lineStatuses?.[0]?.reason || null
      }));
      
      // Try to fetch Elizabeth line separately since it might not be in tube mode
      try {
        const elizabethResponse = await fetch(`${TFL_API_BASE_URL}/line/elizabeth/status`);
        if (elizabethResponse.ok) {
          const elizabethData = await elizabethResponse.json();
          if (elizabethData[0]) {
            lineStatuses.push({
              id: 'elizabeth',
              name: 'Elizabeth',
              status: elizabethData[0].lineStatuses?.[0]?.statusSeverityDescription || 'Unknown',
              statusSeverity: elizabethData[0].lineStatuses?.[0]?.statusSeverity || 0,
              reason: elizabethData[0].lineStatuses?.[0]?.reason || null
            });
          }
        }
      } catch (elizabethError) {
        console.warn('Could not fetch Elizabeth line status:', elizabethError);
        // Add Elizabeth line with unknown status
        lineStatuses.push({
          id: 'elizabeth',
          name: 'Elizabeth',
          status: 'Status Unavailable',
          statusSeverity: 0,
          reason: null
        });
      }
      
      return lineStatuses;
    } catch (error) {
      console.error('Error fetching TFL status:', error);
      throw error;
    }
  }
};