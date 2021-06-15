import axios from 'axios';

const apiRequest = axios.create({
   baseURL: 'http://127.0.0.1:5000/',
   headers: {
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5000/',
      'Access-Control-Allow-Headers': '*',
   }
});

export const api_bias_low = data => apiRequest.get('/bias_low', data);
export const api_macd = data => apiRequest.get('/macd', data);
export const api_good = data => apiRequest.get('/good', data);

export const api_price = data => apiRequest.get('/price?sid=' + data);
export const api_price_cmoney = data => apiRequest.get('/price_cmoney?sid=' + data);
export const api_game = data => apiRequest.get('/game?sid=' + data);

export const api_cmoney = data => apiRequest.get('/cmoney?account=' + data);
export const api_line_notify = data => apiRequest.post('/line_notify', data);
