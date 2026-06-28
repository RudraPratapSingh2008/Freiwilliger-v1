import axios from '../lib/axios';

export async function startVerification() {
  const { data } = await axios.get('/auth/digilocker/initiate');
  const consentUrl = data.data?.consentUrl;
  if (consentUrl) {
    window.open(consentUrl, '_blank', 'width=600,height=700');
  }
  return consentUrl;
}
