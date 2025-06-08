import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import MenuSection from "../components/MenuSection"
import "./BlockSelectPage.css"

const apiUrl = import.meta.env.VITE_API_URL ?? ""

const BlockSelectPage = () => {
  const [blocks, setBlocks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/blocks?page=1&pageSize=100`)
        if (!res.ok) throw new Error("Ошибка загрузки")
        const json = await res.json()
        console.log(json)
        setBlocks(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlocks()
  }, [])

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm("Удалить этот блок навсегда?")) return;

    try {
      const resp = await fetch(`${apiUrl}/api/blocks/${blockId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (resp.ok) {
        setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
      } else {
        const errorText = await resp.text();
        alert(`Ошибка удаления блока: ${resp.status} - ${errorText}`);
      }
    } catch (e) {
      alert(`Произошла ошибка при удалении: ${e.message}`);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) return <div className="loading">Загрузка блоков…</div>
  if (error) return <div className="error">Ошибка: {error}</div>

  return (
    <div className="page">
      <MenuSection />
      <div className="block-select-page">
        <Header title="Выбрать блок" />
        <div className="container">
          <div className="blocks-grid">
            {blocks.map(b => (
              <div key={b.id} className="block-card">
                <h3>{truncateText(b.languages.ru?.title || b.languages.en?.title || b.languages.ar?.title || b.languages.zh?.title || 'Без названия', 30)}</h3>
                <h4>{truncateText(b.languages.ru?.content || b.languages.en?.content || b.languages.ar?.content || b.languages.zh?.content || 'Без описания', 75)}</h4>
                <div className="block-actions">
                  <Link
                    onClick={() => handleDeleteBlock(b.id)}
                    className="delete-button"
                  >
                    Удалить
                  </Link>
                  <Link to={`/blocks/edit/${b.id}`} className="edit-button">
                    Редактировать
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockSelectPage
