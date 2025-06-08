import React from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const Header = ({ title, onDelete }) => (
  <header className="header">
    <h2 className="section-title">{title}</h2>
    <div className="header-controls">
      {onDelete && (
        <button className="delete-button" onClick={onDelete}>
          Удалить блок
        </button>
      )}
    </div>
  </header>
)

export default Header