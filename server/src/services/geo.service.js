const axios = require('axios');
const pThrottle = require('p-throttle');

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'Freiwilliger/1.0';

// Create a throttled version of the Nominatim API call
// 1 request per second
const throttledNominatimRequest = pThrottle({
  limit: 1,
  interval: 1000
})(async (lat, lng) => {
  try {
    const response = await axios.get(NOMINATIM_BASE_URL, {
      params: {
        lat,
        lon: lng,
        format: 'json',
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    const address = response.data.address;
    if (address) {
      return {
        city: address.city || address.town || address.village,
        state: address.state,
        country: address.country,
      };
    } else {
      throw new Error('Could not find address details for the given coordinates.');
    }
  } catch (error) {
    console.error('Error in Nominatim reverse geocoding:', error.message);
    throw new Error('Failed to reverse geocode coordinates.');
  }
});

const reverseGeocode = async (lat, lng) => {
  return throttledNominatimRequest(lat, lng);
};

module.exports = { reverseGeocode };
