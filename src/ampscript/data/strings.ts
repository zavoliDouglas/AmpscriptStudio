// ampscript/data/strings.ts
// Strings/variáveis internas do AMPscript, extraídas da doc da Salesforce
// (PDF fornecido). São fatos (nomes/valores), usados por regras e, no futuro,
// por autocomplete e realce.

// System time/date strings (usadas sem @, ex.: v(xtlongdate)).
export const SYSTEM_DATE_STRINGS = new Set(
  ['xtmonth', 'xtmonthnumeric', 'xtday', 'xtdayofweek', 'xtyear', 'xtshortdate', 'xtlongdate']
    .map((s) => s.toUpperCase()),
);

// Valores válidos da variável _messagecontext.
export const MESSAGE_CONTEXT_VALUES = new Set([
  'FTAF', 'LANDINGPAGE', 'LINKRESOLUTION', 'PREVIEW', 'SEND',
  'SITE', 'SMS', 'SOCIAL', 'VALIDATION', 'VAWP',
]);

// Personalization strings do remetente.
export const SENDER_STRINGS = [
  'memberid', 'replyname', 'replyemailaddress', 'member_busname', 'member_addr',
  'member_city', 'member_state', 'member_postalcode', 'member_country',
];

// Personalization strings do destinatário (contato).
export const RECIPIENT_STRINGS = [
  '_carrierId', '_channel', '_city', '_createdBy', '_createdDate', '_country_code',
  '_emailaddr', '_firstname', '_fullname', '_lastname', '_messageTypePreference',
  '_mobileNumber', '_modifiedBy', '_modifiedDate', '_priority', '_source',
  '_sourceObjectID', '_state', '_status', '_UTCOffset', '_zipCode',
];

// Outras variáveis de sistema comuns (vistas nos exemplos da doc).
export const SYSTEM_VARIABLES = [
  '_messagecontext', 'SubscriberID', 'JobID', '_JobSubscriberBatchID',
];
