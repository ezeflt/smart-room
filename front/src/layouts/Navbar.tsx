import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './navbar.css';
import { UserState } from '../store/user';
import { State, userSelector } from '../store/selector';

const Navbar = () => {
    const user = useSelector<State, UserState>(userSelector);

    return (
        <div className="navbar">
            <ul className="nav-list">
                {navList.map((item, i) => (
                    <li key={i}>
                        <Link to={`/${item.value}`} className="nav-link">
                            <span>{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const navList = [
    { label: 'Alarm', value: 'alarm' },
    { label: 'Weather', value: 'weather' },
    { label: 'Office', value: 'office' },
];

export default Navbar;
