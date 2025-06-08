import { useEffect, useState } from 'react';
import Hierarchy from '../components/Hierarchy/index';
import MenuSection from '../components/MenuSection';
import Header from '../components/Header';
import './HomePage.css';

const HomePage = () => {
  const [hierarchyData, setHierarchyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const flattenTreeData = (nodes, parentId = null, flatList = []) => {
    nodes.forEach(node => {
      flatList.push({
        parent_id: node.parent || parentId,
        children_id: node.id,
        children_title: node.languages.ru?.title || node.languages[Object.keys(node.languages)[0]]?.title || 'No Title'
      });

      if (node.children && node.children.length > 0) {
        flattenTreeData(node.children, node.id, flatList);
      }
    });
    return flatList;
  };

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const response = await fetch('/api/blocks/tree');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error. Status: ${response.status}. Details: ${errorText}`);
        }
        const result = await response.json();
        
        const rootNodes = Array.isArray(result) ? result : [result];
        const transformedData = flattenTreeData(rootNodes);
        
        setHierarchyData(transformedData);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchyData();
  }, []);

  if (loading) return <div>Загрузка данных...</div>;
  if (error) return <div>Ошибка при загрузке данных: {error.message}</div>;

  return (
    <div className="page">
      <MenuSection />

      <div className="hierarchy">
        <Header title="Иерархия блоков" />
        <Hierarchy data={hierarchyData} />
      </div>
    </div>
  );
};

export default HomePage;