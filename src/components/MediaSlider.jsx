import { useRef } from 'react'
import './Photos.css'

const MediaSlider = ({
  type,
  files,
  currentIndex,
  onAdd,
  onDelete,
  onChangeIndex,
  accept,
  label
}) => {
  const fileInput = useRef(null)

  const handleAdd = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file,
      isExisting: false
    }))
    onAdd(type, newFiles)
  }

  const MediaComponent = type === 'image' ? 'img' : 'video'

  return (
    <div className="media-section">
      <h3>{label}</h3>
      
      <div className="preview-slider">
        {files.length > 0 ? (
          <>
            <MediaComponent 
              src={files[currentIndex]?.url} 
              controls={type === 'video'}
              className={files[currentIndex]?.isExisting ? 'existing' : 'new'}
            />
            <div className="counter">
              {currentIndex + 1} / {files.length}
            </div>
            <div className="slider-controls">
              <button 
                className="media-controls-button"
                onClick={() => onChangeIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                назад
              </button>
              <button 
                className="delete-media-button"
                onClick={() => onDelete(type, currentIndex)}
                disabled={files.length === 0}
              >
                удалить
              </button>
              <button 
                className="media-controls-button"
                onClick={() => onChangeIndex((prev) => Math.min(files.length - 1, prev + 1))}
                disabled={currentIndex === files.length - 1}
              >
                вперед
              </button>
            </div>
          </>
        ) : (
          <p>Добавьте {label.toLowerCase()} для предпросмотра</p>
        )}
      </div>

      <div className="upload-controls">
        <input
          type="file"
          ref={fileInput}
          accept={accept}
          multiple
          onChange={handleAdd}
          hidden
        />
        <button className="upload-controls-button" onClick={() => fileInput.current.click()}>
          добавить {label.toLowerCase()}
        </button>
      </div>
    </div>
  )
}

export default MediaSlider