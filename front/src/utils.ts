import config from './config.json';

export const getApiKey = (): string => {
    const prodApiKey = (import.meta as any).env.VITE_API as string;
    const localApiKey = (config as any).VITE_API as string;
    const ENV = (process as any)?.env?.ENVIRONMENT || (import.meta as any).env.VITE_ENVIRONMENT as string;
    const SERVER_URL = ENV === 'local' ? localApiKey : prodApiKey;

    return SERVER_URL;
}