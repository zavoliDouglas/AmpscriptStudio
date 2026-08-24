// ampscript/data/functions.ts
// Catálogo canônico de funções AMPscript, por categoria.
// Fonte: índice de funções do ampscript.guide (nomes de função são fatos,
// não texto protegido). Esta é a "base de verdade" que o validador consulta —
// fica versionada no repo, não na memória de ninguém.
//
// AMPscript é case-insensitive nos nomes de função; guardamos a grafia canônica
// para (a) sinalizar função desconhecida e (b) sugerir a grafia correta.

export const FUNCTION_CATEGORIES: Record<string, readonly string[]> = {
  'Marketing Cloud API': [
    'AddObjectArrayItem', 'CreateObject', 'InvokeCreate', 'InvokeDelete',
    'InvokeExecute', 'InvokePerform', 'InvokeRetrieve', 'InvokeUpdate', 'SetObjectProperty',
  ],
  'Contact Model': ['UpsertContact'],
  'Content': [
    'AttachFile', 'BarcodeURL', 'BeginImpressionRegion', 'BuildOptionList',
    'BuildRowsetFromJSON', 'BuildRowSetFromString', 'BuildRowSetFromXML',
    'ContentArea', 'ContentAreaByName', 'ContentBlockByID', 'ContentBlockByKey',
    'ContentBlockByName', 'ContentImageByID', 'ContentImageByKey', 'EndImpressionRegion',
    'GetPortfolioItem', 'Image', 'TransformXML', 'TreatAsContent', 'TreatAsContentArea',
    'WAT', 'WATP',
  ],
  'Data Extension': [
    'ClaimRow', 'ClaimRowValue', 'DataExtensionRowCount', 'DeleteData', 'DeleteDE',
    'ExecuteFilter', 'ExecuteFilterOrderedRows', 'Field', 'InsertData', 'InsertDE',
    'Lookup', 'LookupOrderedRows', 'LookupOrderedRowsCS', 'LookupRows', 'LookupRowsCS',
    'Row', 'RowCount', 'UpdateData', 'UpdateDE', 'UpsertData', 'UpsertDE',
  ],
  'Date & Time': [
    'DateAdd', 'DateDiff', 'DateParse', 'DatePart', 'FormatDate', 'GetSendTime',
    'LocalDateToSystemDate', 'Now', 'SystemDateToLocalDate',
  ],
  'Einstein Email Recommendation': ['RatingStars'],
  'Encryption & Encoding': [
    'Base64Decode', 'Base64Encode', 'DecryptSymmetric', 'EncryptSymmetric',
    'GetJWT', 'GetJWTByKeyName', 'MD5', 'SHA1', 'SHA256', 'SHA512',
  ],
  'HTTP': [
    'HTTPGet', 'HTTPPost', 'HTTPPost2', 'HTTPPostWithRetry', 'HTTPRequestHeader',
    'IsCHTMLBrowser', 'RedirectTo', 'UrlEncode', 'WrapLongURL',
  ],
  'Math': ['Add', 'Divide', 'Mod', 'Multiply', 'Random', 'Subtract'],
  'Microsoft Dynamics CRM': [
    'AddMSCRMListMember', 'CreateMSCRMRecord', 'DescribeMSCRMEntities',
    'DescribeMSCRMEntityAttributes', 'RetrieveMSCRMRecords', 'RetrieveMSCRMRecordsFetchXML',
    'SetStateMSCRMRecord', 'UpdateMSCRMRecords', 'UpsertMSCRMRecord',
  ],
  'MobileConnect': ['CreateSmsConversation', 'EndSmsConversation', 'SetSmsConversationNextKeyword'],
  'Sales & Service Cloud': [
    'CreateSalesforceObject', 'LongSFID', 'RetrieveSalesforceJobSources',
    'RetrieveSalesforceObjects', 'UpdateSingleSalesforceObject',
  ],
  'Site-Based': [
    'AuthenticatedEmployeeID', 'AuthenticatedEmployeeNotificationAddress',
    'AuthenticatedEmployeeUserName', 'AuthenticatedEnterpriseID', 'AuthenticatedMemberID',
    'AuthenticatedMemberName', 'CloudPagesURL', 'IsNullDefault', 'LiveContentMicrositeURL',
    'MicrositeURL', 'QueryParameter', 'Redirect', 'RequestParameter',
  ],
  'Social': ['GetPublishedSocialContent', 'GetSocialPublishURL', 'GetSocialPublishURLByName'],
  'String': [
    'Char', 'Concat', 'IndexOf', 'Length', 'Lowercase', 'ProperCase', 'RegExMatch',
    'Replace', 'ReplaceList', 'StringToDate', 'StringToHex', 'Substring', 'Trim', 'Uppercase',
  ],
  'Utility': [
    'AttributeValue', 'Domain', 'Empty', 'Format', 'FormatCurrency', 'FormatNumber',
    'GUID', 'Iif', 'IsEmailAddress', 'IsNull', 'IsPhoneNumber', 'Output', 'OutputLine',
    'RaiseError', 'V',
  ],
  'AMPscript & SSJS': ['GetValue', 'SetValue'],
};

/** Nome canônico indexado por versão MAIÚSCULA, para lookup case-insensitive. */
export const CANONICAL_BY_UPPER: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const names of Object.values(FUNCTION_CATEGORIES)) {
    for (const name of names) map[name.toUpperCase()] = name;
  }
  return map;
})();

export function isKnownFunction(name: string): boolean {
  return name.toUpperCase() in CANONICAL_BY_UPPER;
}

/** Retorna a grafia canônica, ou null se a função não existir no catálogo. */
export function canonicalName(name: string): string | null {
  return CANONICAL_BY_UPPER[name.toUpperCase()] ?? null;
}

export const FUNCTION_COUNT = Object.values(FUNCTION_CATEGORIES)
  .reduce((sum, names) => sum + names.length, 0);

// Assinaturas (aridade) — indexadas por nome MAIÚSCULO. max=null => variádica.
// Só listamos funções cuja aridade é bem estabelecida na doc da Salesforce.
// O validador só checa funções presentes aqui, evitando falsos positivos.
export interface Signature { min: number; max: number | null }

export const SIGNATURES: Record<string, Signature> = {
  // Utility
  FORMATCURRENCY: { min: 2, max: 4 }, // number, cultureCode, [decimalPlaces], [currencySymbol]
  ATTRIBUTEVALUE: { min: 1, max: 1 },
  IIF: { min: 3, max: 3 },
  EMPTY: { min: 1, max: 1 },
  ISNULL: { min: 1, max: 1 },
  V: { min: 1, max: 1 },
  // String
  CONCAT: { min: 1, max: null },
  // Data Extension
  ROWCOUNT: { min: 1, max: 1 },
  ROW: { min: 2, max: 2 },
  FIELD: { min: 2, max: 3 }, // row, name/ordinal, [suppressError]
  LOOKUP: { min: 4, max: null },     // DE, returnCol, col, val, [col, val]...
  LOOKUPROWS: { min: 3, max: null }, // DE, col, val, [col, val]...
};

export function signatureOf(name: string): Signature | null {
  return SIGNATURES[name.toUpperCase()] ?? null;
}
