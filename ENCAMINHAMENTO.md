# Encaminhamento e QR Code

Fluxo: questionário → orientações → escolha do hospital → QR Code.
O atendimento recente na tela inicial permite reabrir o fluxo durante a sessão.

## Executar

Inicie a API atualizada e o PostgreSQL configurado. O Hibernate (`ddl-auto: update`)
adiciona `unidade_saude_id` ao chamado. A lista usa os hospitais cadastrados e
filtra pelos sintomas atendidos.

Execute `npm install` e `npx expo start`. Builds nativas anteriores precisam ser
reconstruídas para incluir expo-location, react-native-svg e as permissões.
A localização é solicitada ao tocar em “Usar minha localização”, em primeiro plano:
https://docs.expo.dev/versions/v54.0.0/sdk/location/

## Contrato

- GET `/v1/unidades-saude?sintoma=FEBRE&latitude=-3.74&longitude=-38.53` retorna
  `{ id, nome, endereco, distanciaKm }[]`, por distância em linha reta.
  Sem coordenadas, ordena por nome e retorna distância nula.
- PUT `/v1/paciente/{pacienteId}/chamado/{chamadoId}/encaminhamento`, com
  `{ "unidadeSaudeId": 1 }`, salva a unidade e retorna `{ chamadoId, hospital, qrCode }`.
  Repetir a seleção não cria outro chamado.
- QR: `medmaisfacil:checkin:v1:<chamadoId>:<unidadeSaudeId>`.
  É identificador de apresentação, não uma credencial de autenticação.

A seleção prepara o check-in, preservando AGUARDANDO_TRIAGEM. O endpoint existente
do totem confirma a entrada na fila após registrar os sinais vitais.
O totem-web ainda não implementa leitura deste QR; o consumidor deverá consultar
os dados atuais do chamado e validar a unidade antes de continuar seu fluxo.

## Validação manual em aparelho

1. Cadastre um paciente, responda ao questionário e toque em “Escolher hospital”.
2. Autorize a localização e confira ordem e distâncias.
3. Negue a permissão ou desative o GPS: a seleção manual deve continuar disponível.
4. Selecione e confirme: o QR só deve aparecer após a resposta da API.
5. Troque a unidade, confira o novo código e reabra pelo atendimento recente.
6. Desligue a API e confira erro e nova tentativa.

O app entra pelo endpoint `/v1/auth/login`, envia e-mail e senha e guarda o JWT
no armazenamento seguro do dispositivo. As chamadas seguintes incluem o token.
O cadastro inicia uma sessão automaticamente após criar o paciente.
