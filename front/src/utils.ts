import config from './config.json';

export const getApiKey = (): string => {
    const envApi = (import.meta as any).env.VITE_API as string | undefined;
    const envApiUrl = (import.meta as any).env.VITE_API_URL as string | undefined;
    const environment = (process as any)?.env?.ENVIRONMENT || (import.meta as any).env.VITE_ENVIRONMENT as string | undefined;

    const localApiKey = (config as any)?.VITE_API as string | undefined;

    const selected = environment === 'local'
        ? (localApiKey || envApi || envApiUrl)
        : (envApi || envApiUrl || localApiKey);

    const url = selected || '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};