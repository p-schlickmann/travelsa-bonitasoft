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
    const {data: trips} = await makeAuthenticatedAPICall('/API/bdm/businessData/travel.sa.model.P01Viagem?q=find&p=0&c=99')
    console.log("\n🌍 Viagens disponíveis:");
    trips.forEach((trip, idx) => {
      console.log(`${idx + 1}. ${trip.nome} (Início: ${trip.inicio}, Fim: ${trip.fim})`);
    });
    const selectedTripIndex = await getUserInput('\nDigite o número da viagem que deseja selecionar: ');
    const selectedTrip = trips[parseInt(selectedTripIndex, 10) - 1];

    if (!selectedTrip) {
      console.error("❌  Viagem inválida selecionada.");
      return;
    }
    console.log(`✅  Você selecionou a viagem: ${selectedTrip.nome}`);

    const email = await getUserInput('\n📧 Por favor insira seu email para mais informações sobre a viagem: ');
    const name = await getUserInput('🙂 E seu nome: ');

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
          "nomeCliente": {
            "value": name,
            "type": "java.lang.String"
          },
          "viagemId": {
            "value": selectedTrip.persistenceId,
            "type": "java.lang.Integer"
          }
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
