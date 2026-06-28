const axios = require('axios');

const DIGILOCKER_BASE_URL = 'https://api.digitallocker.gov.in';
const DIGILOCKER_AUTH_URL = 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize';
const DIGILOCKER_TOKEN_URL = 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/token';
const DIGILOCKER_AADHAAR_URL = `${DIGILOCKER_BASE_URL}/public/oauth2/1/xml/eaadhaar`;

const {
  DIGILOCKER_CLIENT_ID,
  DIGILOCKER_CLIENT_SECRET,
  DIGILOCKER_REDIRECT_URI,
} = process.env;

/**
 * Build the DigiLocker OAuth2 consent/authorization URL.
 * The `state` param encodes the userId for the callback to identify the user.
 */
function getConsentUrl(userId) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: DIGILOCKER_CLIENT_ID,
    redirect_uri: DIGILOCKER_REDIRECT_URI,
    state: userId,
    scope: 'openid',
  });

  return `${DIGILOCKER_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for an access token.
 */
async function exchangeCodeForToken(code) {
  const response = await axios.post(DIGILOCKER_TOKEN_URL, null, {
    params: {
      code,
      grant_type: 'authorization_code',
      client_id: DIGILOCKER_CLIENT_ID,
      client_secret: DIGILOCKER_CLIENT_SECRET,
      redirect_uri: DIGILOCKER_REDIRECT_URI,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data; // { access_token, token_type, expires_in, ... }
}

/**
 * Fetch the Aadhaar XML document using the access token.
 */
async function fetchAadhaarDocument(accessToken) {
  const response = await axios.get(DIGILOCKER_AADHAAR_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data; // XML string
}

/**
 * Parse the Aadhaar XML string and extract relevant fields.
 * Only stores the last 4 digits of the Aadhaar number for data minimisation.
 */
function parseAadhaarXml(xmlString) {
  // DigiLocker Aadhaar XML has attributes like:
  // <PrintLetterBil498 uid="XXXX XXXX 1234" name="..." dob="..." gender="..." ...>
  //   <Photo>base64...</Photo>
  // </PrintLetterBilingual>

  const uidMatch = xmlString.match(/uid="([^"]+)"/);
  const nameMatch = xmlString.match(/name="([^"]+)"/);
  const dobMatch = xmlString.match(/dob="([^"]+)"/);
  const genderMatch = xmlString.match(/gender="([^"]+)"/);
  const photoMatch = xmlString.match(/<Photo>([^<]+)<\/Photo>/);

  const uid = uidMatch ? uidMatch[1].replace(/\s/g, '') : '';
  const lastFourDigits = uid.slice(-4);

  return {
    lastFourDigits,
    name: nameMatch ? nameMatch[1] : '',
    dob: dobMatch ? dobMatch[1] : '',
    gender: genderMatch ? genderMatch[1] : '',
    photo: photoMatch ? photoMatch[1] : '', // base64
  };
}

module.exports = {
  getConsentUrl,
  exchangeCodeForToken,
  fetchAadhaarDocument,
  parseAadhaarXml,
};
