const { loginToBonita, makeAuthenticatedAPICall, getUserInput } = require('./utils.js')


async function main() {
  try {
    await loginToBonita();

    const idReserva = getUserInput('📧 ID da reserva: ');
    const {data: reservas} = await makeAuthenticatedAPICall('/API/bdm/businessData/travel.sa.model.P01Reserva?q=find&p=0&c=99')
    const reserva = reservas.find(reserva => reserva.persistenceId_string === idReserva)
    if (!reserva || reserva.dataPreenchimento) {
      console.error("❌  ID da reserva inválido");
      return;
    }

    const nacionalidade = getUserInput('Pais de nacionalidade [Brasil]: ');
    const estadoCivil = getUserInput('Estado civil [Solteiro, Casado, etc]: ')
    const profissao = getUserInput('Profissao: ')
    const dataNascimento = getUserInput('Data de nascimento (YYYY-MM-DD) [Ex: 2001-09-21]: ')
    const rg = getUserInput('RG: ')
    const cpf = getUserInput('CPF: ')
    const passaporte = getUserInput('Numero do passaporte: ')
    const validadePassaporte = getUserInput('Data de validade do passaporte (YYYY-MM-DD) [Ex: 2033-12-20]: ')

    const sendContract = await makeAuthenticatedAPICall(
      '/API/bpm/message',
      'POST',
      {
        "messageName": "receiveContract",
        "targetProcess": "Solicitacao de Viagem",
        "messageContent": {
          "nacionalidade": {
            "value": nacionalidade,
            "type": "java.lang.String"
          },
          "estadoCivil": {
            "value": estadoCivil,
            "type": "java.lang.String"
          },
          "profissao": {
            "value": profissao,
            "type": "java.lang.String"
          },
          "dataNascimento": {
            "value": dataNascimento,
            "type": "java.lang.String"
          },
          "rg": {
            "value": rg,
            "type": "java.lang.String"
          },
          "cpf": {
            "value": cpf,
            "type": "java.lang.String"
          },
          "passaporte": {
            "value": passaporte,
            "type": "java.lang.String"
          },
          "validadePassaporte": {
            "value": validadePassaporte,
            "type": "java.lang.String"
          }
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
