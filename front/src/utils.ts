import config from './config.json';
const VITE_ENV = (import.meta as any).env as any;

export const getApiKey = (): string => {
    const environment = VITE_ENV.VITE_ENVIRONMENT;

    const prodApiKey = VITE_ENV.VITE_API;
    const localApiKey = config.LOCAL_API;

    const apiKey = environment === 'local' ? localApiKey : prodApiKey;
    return apiKey;
};
