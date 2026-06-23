const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'Freiwilliger/1.0';

let lastRequestAt = 0;

const waitIfNeeded = async () => {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestAt = Date.now();
};

const throttledNominatimRequest = async (lat, lng) => {
  try {
    await waitIfNeeded();

    const url = new URL(NOMINATIM_BASE_URL);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lng);
    url.searchParams.set('format', 'json');

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();
    const address = data.address;
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
};

const reverseGeocode = async (lat, lng) => {
  return throttledNominatimRequest(lat, lng);
};

module.exports = { reverseGeocode };
