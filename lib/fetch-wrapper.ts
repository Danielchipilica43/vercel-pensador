// lib/fetch-wrapper.ts
export const fetchWithLog = async (url: string, options?: RequestInit) => {
  console.log(`📡 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, options);
    if (!response.ok && response.status === 404) {
      console.error(`❌ 404 - Rota não encontrada: ${url}`);
    }
    return response;
  } catch (error) {
    console.error(`❌ Erro ao fetch: ${url}`, error);
    throw error;
  }
};