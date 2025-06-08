import { Link } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';
import './MenuSection.css';
import exitIcon from '/exitIcon.svg';
import hierarchyIcon from '/hierarchyIcon.svg';
import addBlockIcon from '/addBlockIcon.svg';
import editBlockIcon from '/editBlockIcon.svg';
import broadcastIcon from '/broadcastIcon.svg';

const MenuSection = () => {
    const { user, logout } = useAuth();
    return (
        <div className="menu-section">
            <header className="menu-header">
                <h1>{user?.username || 'Пользователь'}</h1>
            </header>
            <div className="button-container">
                <Link to="#" onClick={logout} className="exit-button">
                    <span className="button-text">выход</span>
                    <img className="btnIcon" src={exitIcon} alt="exitIcon"/>
                </Link>
                <p>Меню: </p>
                <Link to="/" className="menu-button">
                    <span className="button-text">главная</span>
                    <img className="btnIcon" src={hierarchyIcon} alt="hierarchyIcon"/>
                </Link>
                <Link to="/blocks/new" className="menu-button">
                    <span className="button-text">добавление блоков</span>
                    <img className="btnIcon" src={addBlockIcon} alt="addBlockIcon"/>
                </Link>
                <Link to="/blocks/select" className="menu-button">
                    <span className="button-text">редактирование блоков</span>
                    <img className="btnIcon" src={editBlockIcon} alt="editBlockIcon"/>
                </Link>
                <Link to="/broadcast" className="menu-button">
                    <span className="button-text">рассылка</span>
                    <img className="btnIcon" src={broadcastIcon} alt="broadcastIcon"/>
                </Link>
            </div>
        </div>
    );
};

export default MenuSection;