import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export default {
  baseUrl: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
  apiUrl: process.env.API_URL || 'https://api.practicesoftwaretesting.com',
  headless: process.env.HEADLESS !== 'false',
};
