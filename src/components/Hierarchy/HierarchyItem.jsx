import { memo, useState, useEffect } from 'react'
import './Hierarchy.css'

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowWidth
}

const HierarchyItem = memo(({ item, level = 0, hasSibling = false, expandedNodes, toggleNode }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const windowWidth = useWindowWidth()
  
  const getIndent = () => {
    if (windowWidth < 768) return 20
    if (windowWidth < 1400) return 30
    return 40
  }

  const handleClick = () => {
    toggleNode(item.id)
    setIsExpanded(!isExpanded)
  }

  const isNodeExpanded = expandedNodes.has(item.id)

  return (
    <div className="hierarchy-item">
      <div 
        className="item-content" 
        style={{ marginLeft: `${level * getIndent()}px` }}
        onClick={handleClick}
      >
        <div className={`card ${isNodeExpanded ? 'expanded' : ''}`}>
          <h3 className="card-title">{item.title}</h3>
          {item.children?.length > 0 && (
            <span className="toggle-icon">
              {isNodeExpanded ? '▼' : '▶'}
            </span>
          )}
        </div>
      </div>
      
      {isNodeExpanded && item.children?.map((child, index) => (
        <HierarchyItem 
          key={child.id}
          item={child}
          level={level + 1}
          hasSibling={index < item.children.length - 1}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  )
})
export default HierarchyItem