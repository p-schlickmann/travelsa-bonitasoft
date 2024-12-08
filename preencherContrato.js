const { loginToBonita, makeAuthenticatedAPICall, getUserInput } = require('./utils.js')


async function main() {
  try {
    await loginToBonita();

    const idReserva = await getUserInput('📧 ID da reserva: ');
    const {data: reservas} = await makeAuthenticatedAPICall('/API/bdm/businessData/travel.sa.model.P01Reserva?q=find&p=0&c=99')
    const reservaExists = reservas.find(reserva => reserva.persistenceId_string === idReserva)
    if (!reservaExists) {
      console.error("❌  ID da reserva inválido");
      return;
    }

    const sendContract = await makeAuthenticatedAPICall(
      '/API/bpm/message',
      'POST',
      {
        "messageName": "receiveContract",
        "targetProcess": "Solicitacao de Viagem",
        "messageContent": {
          "contratoValido": {
            "value": true,
            "type": "java.lang.Boolean"
          },
        },
        "correlations": {
          "reservaId": {
            "value": parseInt(idReserva),
            "type": "java.lang.Long"
          }
        }
      }
    );

    if (sendContract.status !== 204) {
      console.error(`Erro ao preencher o contrato da reserva ${idReserva}: `, sendContract.data)
      return
    }
    console.log("✅  Contrato da reserva assinado")
  } catch (e) {
    console.error(e.response.data || e.message)
  }
}

main()
