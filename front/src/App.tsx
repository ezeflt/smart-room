import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';

function App() {
    const isNotLoginPage = useLocation().pathname !== '/login';
    const isConnected = true;
    
    return (
        <div className="app">
            {isConnected && isNotLoginPage && <Header />}
            <div id="container">
                <Outlet />
            </div>
        </div>
    );
}

export default App;