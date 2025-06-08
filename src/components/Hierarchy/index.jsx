import { useEffect, useState } from 'react'
import HierarchyItem from './HierarchyItem'
import './Hierarchy.css'

const Hierarchy = ({ data }) => {
  const [structuredData, setStructuredData] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  useEffect(() => {
    const buildStructure = () => {
      const map = new Map()
      data.forEach(({ parent_id, children_id, children_title }) => {
        map.set(children_id, {
          id: children_id,
          title: children_title,
          parentId: parent_id,
          children: []
        })
      })

      map.forEach(node => {
        if (node.parentId && map.has(node.parentId)) {
          const parent = map.get(node.parentId)
          parent.children.push(node)
        }
      })

      return Array.from(map.values()).filter(node => !node.parentId)
    }

    setStructuredData(buildStructure())
  }, [data])

  if (!structuredData) return null

  return (
    <div className="hierarchy-container">
      {structuredData.map((rootItem, index) => (
        <HierarchyItem
          key={rootItem.id}
          item={rootItem}
          hasSibling={index < structuredData.length - 1}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  )
}

export default Hierarchy