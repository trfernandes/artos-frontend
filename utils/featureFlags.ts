// Gates temporários de feature enquanto backend e frontend não sobem juntos.
// A URL do backend já vem escopada por ambiente (eas.json), então derivamos daqui
// em vez de criar env var nova.
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

const isStagingBackend = apiUrl.includes('diakonia-backend-staging');

// Limpar setlist inteiro depende de DELETE /igrejas/:id/eventos/:id/setlist, que só
// existe no backend de staging. Remover este gate quando o endpoint estiver em produção.
export const SETLIST_CLEAR_ENABLED = isStagingBackend;
