# Automação TRAVEL SA
Alunos: 
- Henrique Soares de Carvalho (20200616)
- Pedro Schlickmann Mendes (20200635)

## Inserir viagens iniciais no banco de dados
1. Feche completamente o Bonita Studio.
2. Localize o seu arquivo `h2.jar`. Ele vem instalado junto com o bonita. No MacOSX está no caminho `/Applications/BonitaStudioCommunity-2022.2-u0.app/Contents/Eclipse/workspace/tomcat/server/lib/bonita/h2-1.4.199.jar `
3. Execute o arquivo `h2.jar` para iniciar o banco de dados. Comando `java -jar <caminho_do_arquivo>`
4. Abra o console do h2: http://localhost:8082/login.jsp
5. Selecione "Generic H2 (Embedded)"
6. Preencha a `JDBC URL` com o caminho do seu banco de dados local. Isso é salvo dentro do diretório do projeto em `./h2_database/business_data.db`. Copie o caminho absoluto para previnir erros. Exemplo no MacOSX: `jdbc:h2:/Applications/BonitaStudioCommunity-2022.2-u0.app/Contents/Eclipse/workspace/Travel SA/h2_database/business_data.db`
7. Clique em "Test Connection", é importante verificar antes de conectar, se não ele pode criar um banco de dados novo, vazio.
8. Caso a conexão tenha sido bem sucedida, clique em "Connect", se não, ajuste seu caminho de arquivo e verifique que o Bonita Studio está fechado.
9. Clique na tabela `P01VIAGEM` e insira a seguinte query:
```sql
INSERT INTO P01VIAGEM (
    PERSISTENCEID,
    PERSISTENCEVERSION,
    NOME,
    INICIO,
    FIM,
    VAGAS,
    VALOR,
) VALUES (
    1,
    1,
    'Guga Arruda Surf',
    '2024-12-05',
    '2024-12-12',
    10,
    10000.00,
);

INSERT INTO P01VIAGEM (
    PERSISTENCEID,
    PERSISTENCEVERSION,
    NOME,
    INICIO,
    FIM,
    VAGAS,
    VALOR,
) VALUES (
    2,
    1,
    'México com Marcelo Trekinho',
    '2025-03-02',
    '2025-03-09',
    12,
    8000.00,
);

INSERT INTO P01VIAGEM (
    PERSISTENCEID,
    PERSISTENCEVERSION,
    NOME,
    INICIO,
    FIM,
    VAGAS,
    VALOR,
) VALUES (
    3,
    1,
    'Yoga no Panama',
    '2025-05-10',
    '2025-05-17',
    8,
    12000.00,
);

INSERT INTO P01VIAGEM (
    PERSISTENCEID,
    PERSISTENCEVERSION,
    NOME,
    INICIO,
    FIM,
    VAGAS,
    VALOR,
) VALUES (
    4,
    1,
    'Viagem com poucas vagas',
    '2025-07-13',
    '2025-07-20',
    2,
    20000.00,
);
```
10. IMPORTANTE: desconecte-se do cliente h2 após finalizar. Clique no botão vermelho do canto superior esquerdo.
11. Reabra o Bonita Studio normalmente.

## Processo P01 - Solicitação de Viagem
### Passos
1. Rode o script `selecionarViagem.js` para iniciar o processo (`node selecionarViagem.js`).
2. Entre com o usuário consultor `marina_damico` (senha: `123`) no endereço http://localhost:8080/bonita/apps/userAppBonita/task-list/?_l=en.
3. Execute a "Human Task" T10.
4. Verifique sua caixa de email e localize o ID de Reserva enviado.
5. Rode o script `preencherContrato.js` (`node preencherContrato.js`).
6. Entre com o usuário controlador `murilo_cassador` (senha: `123`) no endereço http://localhost:8080/bonita/apps/userAppBonita/task-list/?_l=en.
7. Caso o contrato seja válido, existirão 2 "Human Tasks" para serem finalizadas em sequência (T50 e depois T55).
8. Caso o contrato seja inválido, não haverá nenhuma tarefa, já que o processo é finalizado e a reserva cancelada.
