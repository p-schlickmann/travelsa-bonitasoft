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

(async function main() {
  try {
    await loginToBonita();
    const trips = await makeAuthenticatedAPICall('/API/bdm/businessData/travel.sa.model.P01Viagem?q=find&p=0&c=99')
    console.log(trips.data)
    const email = await getUserInput('📧 Por favor insira seu email para mais informações sobre a viagem: ');

    const startProcess = await makeAuthenticatedAPICall(
      '/API/bpm/message',
      'POST',
      {
        "messageName": "receiveReservation",
        "targetProcess": "Solicitacao de Viagem",
        "messageContent": {
          "emailCliente": {
            "value": email,
            "type": "java.lang.String"
          },
        }
      }
    );

    if (startProcess.status !== 204) {
      console.error("Erro inicializando o processo:", startProcess.data)
      return
    }
    console.log(`✅  Processo iniciado: "Solicitacao de Viagem" para ${email}`)
  } catch (e) {
    console.error(e.response.data || e.message)
  }
})();
