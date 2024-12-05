const axios = require('axios');
const readline = require('readline');

// Configuration
const bonitaBaseURL = 'http://localhost:8080/bonita';
const username = 'install';
const password = 'install';

// Variables to store session cookie and API token
let sessionCookie = '';
let apiToken = '';

// Function to log in to Bonita
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

  // Extract session cookie
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

async function createSampleTrips() {
  const sampleTrips = [
    {
      name: "Surf Adventure Bali",
      startDate: "2024-12-01",
      endDate: "2024-12-08",
      maxParticipants: 15,
      packagePrice: 1200.0,
      downPayment: 300.0,
    },
    {
      name: "Yoga Retreat Maldives",
      startDate: "2024-12-10",
      endDate: "2024-12-17",
      maxParticipants: 10,
      packagePrice: 1500.0,
      downPayment: 400.0,
    },
    {
      name: "Cultural Tour Japan",
      startDate: "2024-12-20",
      endDate: "2024-12-27",
      maxParticipants: 12,
      packagePrice: 2000.0,
      downPayment: 500.0,
    },
  ];

  for (const trip of sampleTrips) {
    const response = await makeAuthenticatedAPICall(
      "/API/bdm/businessData/travel.sa.model.P01Viagem",
      "POST",
      {
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        maxParticipants: trip.maxParticipants,
        packagePrice: trip.packagePrice,
        downPayment: trip.downPayment,
      }
    );
    console.log(`✅ Trip "${trip.name}" created successfully.`);
  }
}

(async function main() {
  try {
    const email = await getUserInput('📧 Por favor insira seu email para mais informações sobre a viagem: ');

    await loginToBonita();
    await createSampleTrips();

    const startProcess = await makeAuthenticatedAPICall(
      '/API/bpm/message',
      'POST',
      {
        "messageName": "receiveReservation",
        "targetProcess": "Solicitacao de Viagem",
        "messageContent": {
          "email": {
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
