import { useRef } from 'react'
import './OtherFiles.css'

const OtherFiles = ({ files, onAdd, onDelete }) => {
  const fileInput = useRef(null)

  const handleAdd = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file,
      isExisting: false
    }))
    onAdd('other', newFiles)
  }

  const handleDownload = (file) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(file.url)
  }

  return (
    <div className="media-section">
      <h3>Другие файлы</h3>
      
      <div className="file-list">
        {files.map((file, index) => (
          <div key={file.url} className="file-item">
            <span 
              className="file-link" 
              onClick={() => handleDownload(file)}
            >
              {file.name}
            </span>
            <button className="delete-file-button" onClick={() => onDelete('other', index)}>×</button>
          </div>
        ))}
      </div>

      <div className="upload-controls">
        <input
          type="file"
          ref={fileInput}
          multiple
          onChange={handleAdd}
          hidden
        />
        <button className="upload-controls-button" onClick={() => fileInput.current.click()}>
          добавить файлы
        </button>
      </div>
    </div>
  )
}

export default OtherFiles