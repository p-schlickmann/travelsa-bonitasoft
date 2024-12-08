const axios = require('axios');
const prompt = require('prompt-sync')({ sigint: true });

// Configuration
const bonitaBaseURL = 'http://localhost:8080/bonita';
const username = 'marina_damico';
const password = '123';

// Variables to store session cookie and API token
let sessionCookie = '';
let apiToken = '';

async function loginToBonita() {
  const response = await axios.post(
    `${bonitaBaseURL}/loginservice`,
    `username=${username}&password=${password}&redirect=false`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  sessionCookie = response.headers['set-cookie']
    .find((cookie) => cookie.startsWith('JSESSIONID'))
    .split(';')[0];
  apiToken = response.headers['set-cookie']
    .find((cookie) => cookie.startsWith('X-Bonita-API-Token'))
    .split(';')[0].split("=")[1];
}

async function makeAuthenticatedAPICall(endpoint, method = 'GET', data = {}) {
  return axios({
    url: `${bonitaBaseURL}${endpoint}`,
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'X-Bonita-API-Token': apiToken,
    },
    data,
  });
}

function getUserInput(question) {
  return prompt(question);
}

module.exports = {
  loginToBonita,
  makeAuthenticatedAPICall,
  getUserInput,
}
