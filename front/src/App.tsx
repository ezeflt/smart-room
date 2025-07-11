import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './layouts/Navbar';

function App() {
    return (
        <div className="app">
            <Navbar />
            <div id="container">
                <div className="page-wrapper">
                    <div className="page-content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;