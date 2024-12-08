const axios = require('axios');
const readline = require('readline');

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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

module.exports = {
  loginToBonita,
  makeAuthenticatedAPICall,
  getUserInput,
}
