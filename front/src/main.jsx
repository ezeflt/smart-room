import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import AppRoutes from './routes';
import { store } from './store/configReducer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Return the root element to html element with id 'root'
createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Provider store to the store */}
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {/* RouterProvider to the AppRoutes */}
                <RouterProvider router={AppRoutes} />
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
);
