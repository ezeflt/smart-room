import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './layouts/Header';

function App() {
    return (
        <div className="app">
            <Header />
            <div id="container">
                <Outlet />
            </div>
        </div>
    );
}

export default App;