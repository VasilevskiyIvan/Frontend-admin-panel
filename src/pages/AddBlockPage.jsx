import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Language from '../components/Language';
import Photos from '../components/Photos';
import Videos from '../components/Videos';
import OtherFiles from '../components/OtherFiles';
import MenuSection from '../components/MenuSection';
import './PagesStyle.css';

const AddBlockPage = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [languages, setLanguages] = useState({
    ru: { title: "", content: "" },
    en: { title: "", content: "" },
    zh: { title: "", content: "" },
    ar: { title: "", content: "" },
  });

  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [availableParents, setAvailableParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");

  const flattenTree = (nodes) => {
    let flatList = [];
    nodes.forEach(node => {
      const title = node.languages.ru?.title || node.languages.en?.title || node.id;
      flatList.push({ id: node.id, title: title });
      if (node.children && node.children.length > 0) {
        flatList = flatList.concat(flattenTree(node.children));
      }
    });
    return flatList;
  };

  useEffect(() => {
    const fetchBlocksTree = async () => {
      try {
        const response = await fetch('/api/blocks/tree');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка загрузки дерева блоков: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        const flatBlocks = flattenTree(data);
        setAvailableParents(flatBlocks);
      } catch (error) {
        alert('Ошибка при загрузке блоков для выбора родителя: ' + error.message);
      }
    };
    fetchBlocksTree();
  }, []);

  const handleAddMedia = (type, files) => {
    if (type === 'image') setPhotos(prev => [...prev, ...files]);
    if (type === 'video') setVideos(prev => [...prev, ...files]);
    if (type === 'other') setOtherFiles(prev => [...prev, ...files]);
  };

  const handleDeleteMedia = (type, index) => {
    if (type === 'image') {
      setPhotos(prev => prev.filter((_, i) => i !== index));
      setCurrentPhotoIndex(0);
    }
    if (type === 'video') {
      setVideos(prev => prev.filter((_, i) => i !== index));
      setCurrentVideoIndex(0);
    }
    if (type === 'other') {
      setOtherFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveBlock = async () => {
    const isAtLeastOneLanguageComplete = Object.values(languages).some(
      (lang) => lang.title.trim() !== "" && lang.content.trim() !== ""
    );

    if (!isAtLeastOneLanguageComplete) {
      alert('Пожалуйста, заполните ЗАГОЛОВОК и ОПИСАНИЕ хотя бы для одного языка.');
      return;
    }

    try {
      const payload = {
        languages,
        parent: selectedParent || null
      };
      const blockResponse = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!blockResponse.ok) {
        const errorText = await blockResponse.text();
        throw new Error(`Ошибка создания блока: ${blockResponse.status} - ${errorText}`);
      }
      const { id: blockId } = await blockResponse.json();

      const uploadMedia = async (type, files) => {
        if (files.length === 0) {
          return;
        }
        const formData = new FormData();
        files.forEach((f) => {
          formData.append(type, f.file);
        });

        const mediaResponse = await fetch(`/api/blocks/${blockId}/${type}`, {
          method: 'POST',
          body: formData
        });

        if (!mediaResponse.ok) {
          const errorText = await mediaResponse.text();
          throw new Error(`Ошибка загрузки ${type}: ${mediaResponse.status} - ${errorText}`);
        }
      };

      await Promise.all([
        uploadMedia('photos', photos),
        uploadMedia('videos', videos),
        uploadMedia('files', otherFiles)
      ]);

      navigate('/');
    } catch (error) {
      alert('Ошибка сохранения блока: ' + error.message);
    }
  };

  const handleLanguageChange = (lang, field, value) => {
    setLanguages(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  return (
    <div className="page">
      <MenuSection />
      <div className="add-block-page">
        <Header title="Добавить новый блок" />

        <div className="container">
          <Language
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
            languages={languages}
            onChange={handleLanguageChange}
          />

          <div className="parent-select-group">
            <label htmlFor="parent-select">Родительский блок:</label>
            <select
              id="parent-select"
              className="parent-select"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              <option value="">-- Нет родителя (Корневой блок) --</option>
              {availableParents.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.title}
                </option>
              ))}
            </select>
          </div>

          <Photos
            files={photos}
            currentIndex={currentPhotoIndex}
            onAdd={handleAddMedia}
            onDelete={handleDeleteMedia}
            onChangeIndex={setCurrentPhotoIndex}
          />
          <Videos
            files={videos}
            currentIndex={currentVideoIndex}
            onAdd={handleAddMedia}
            onDelete={handleDeleteMedia}
            onChangeIndex={setCurrentVideoIndex}
          />
          <OtherFiles
            files={otherFiles}
            onAdd={handleAddMedia}
            onDelete={handleDeleteMedia}
          />

          <button className="save-button" onClick={handleSaveBlock}>
            Сохранить блок
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlockPage;