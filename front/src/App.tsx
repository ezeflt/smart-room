import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';

function App() {
    const location = useLocation();
    const isNotLoginPage = location.pathname !== '/login';
    const isConnected = true;
    const isAlarmPage = location.pathname.startsWith('/alarm');

    return (
        <div className={`app ${isAlarmPage ? 'page-alarm' : 'page-default'}`}>
            {isConnected && isNotLoginPage && <Header />}
            <div id="container">
                <Outlet />
            </div>
        </div>
    );
}

export default App;