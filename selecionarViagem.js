const { loginToBonita, makeAuthenticatedAPICall, getUserInput } = require('./utils.js')


async function main() {
  try {
    await loginToBonita();
    const {data: trips} = await makeAuthenticatedAPICall('/API/bdm/businessData/travel.sa.model.P01Viagem?q=find&p=0&c=99')
    console.log("🌍 Viagens disponíveis:");
    trips.forEach((trip, idx) => {
      console.log(`${idx + 1}. ${trip.nome} (Início: ${trip.inicio}, Fim: ${trip.fim})`);
    });
    console.log('\n')
    const selectedTripIndex = getUserInput('Digite o número da viagem que deseja selecionar: ');
    const selectedTrip = trips[parseInt(selectedTripIndex, 10) - 1];

    if (!selectedTrip) {
      console.error("❌  Viagem inválida selecionada.");
      return;
    }
    console.log(`✅  Você selecionou a viagem: ${selectedTrip.nome}`);

    const email = getUserInput('📧 Por favor insira seu email para mais informações sobre a viagem: ');
    const name = getUserInput('🙂 E seu nome: ');

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
}

main()
