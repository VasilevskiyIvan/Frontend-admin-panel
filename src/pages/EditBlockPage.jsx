import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Language from "../components/Language";
import Photos from "../components/Photos";
import Videos from "../components/Videos";
import OtherFiles from "../components/OtherFiles";
import MenuSection from "../components/MenuSection";
import './PagesStyle.css';

const apiUrl = import.meta.env.VITE_API_URL ?? "";

const EditBlockPage = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [languages, setLanguages] = useState({
    ru: { title: "", content: "" },
    en: { title: "", content: "" },
    zh: { title: "", content: "" },
    ar: { title: "", content: "" },
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [availableParents, setAvailableParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");

  const flattenTree = (nodes, currentBlockId = null) => {
    let flatList = [];
    nodes.forEach(node => {
      if (node.id === currentBlockId) {
        return;
      }
      const title = node.languages.ru?.title || node.languages.en?.title || node.id;
      flatList.push({ id: node.id, title: title });
      if (node.children && node.children.length > 0) {
        flatList = flatList.concat(flattenTree(node.children, currentBlockId));
      }
    });
    return flatList;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blockRes, mediaRes, treeRes] = await Promise.all([
          fetch(`${apiUrl}/api/blocks/${blockId}`, { credentials: "include" }),
          fetch(`${apiUrl}/api/blocks/${blockId}/media`, {
            credentials: "include",
          }),
          fetch(`${apiUrl}/api/blocks/tree`, { credentials: "include" }),
        ]);

        if (!blockRes.ok) {
          throw new Error(
            `Failed to fetch block: ${blockRes.status} – ${await blockRes.text()}`
          );
        }
        if (!mediaRes.ok) {
          throw new Error(
            `Failed to fetch media: ${mediaRes.status} – ${await mediaRes.text()}`
          );
        }
        if (!treeRes.ok) {
          throw new Error(
            `Failed to fetch block tree: ${treeRes.status} - ${await treeRes.text()}`
          );
        }

        const blockData = await blockRes.json();
        const mediaData = await mediaRes.json();
        const treeData = await treeRes.json();

        setLanguages(blockData.languages);
        setSelectedParent(blockData.parent || "");

        const flatBlocks = flattenTree(treeData, blockId);
        setAvailableParents(flatBlocks);


        setPhotos(
          (mediaData.photos ?? []).map((url) => ({
            url,
            isExisting: true,
            file: null,
          }))
        );
        setVideos(
          (mediaData.videos ?? []).map((url) => ({
            url,
            isExisting: true,
            file: null,
          }))
        );
        setOtherFiles(
          (mediaData.files ?? []).map((url) => ({
            url,
            name: url.split("/").pop(),
            isExisting: true,
            file: null,
          }))
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [blockId]);

  const handleAddMedia = (type, files) => {
    const newItems = files.map(fileObj => ({
      url: fileObj.url || URL.createObjectURL(fileObj.file),
      isExisting: false,
      file: fileObj.file,
      ...(type === 'other' && { name: fileObj.file.name })
    }));

    if (type === 'image') {
      setPhotos(prev => [...prev, ...newItems]);
    }
    if (type === 'video') {
      setVideos(prev => [...prev, ...newItems]);
    }
    if (type === 'other') {
      setOtherFiles(prev => [...prev, ...newItems]);
    }
  };

  const handleDeleteMedia = async (type, index) => {
    let list, setter, indexSetter;

    if (type === 'image') {
      list = photos;
      setter = setPhotos;
      indexSetter = setCurrentPhotoIndex;
    } else if (type === 'video') {
      list = videos;
      setter = setVideos;
      indexSetter = setCurrentVideoIndex;
    } else if (type === 'other') {
      list = otherFiles;
      setter = setOtherFiles;
      indexSetter = null;
    }

    const item = list[index];
    if (!item) {
      return;
    }

    if (item.isExisting) {
      try {
        const urlParam = encodeURIComponent(item.url);
        const response = await fetch(
          `${apiUrl}/api/blocks/${blockId}/media?url=${urlParam}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (e) {
        alert(`Не удалось удалить файл на сервере: ${e.message}`);
        return;
      }
    }

    const updatedList = list.filter((_, i) => i !== index);
    setter(updatedList);

    if (indexSetter) {
      if (type === 'image') {
        setCurrentPhotoIndex(Math.max(0, Math.min(currentPhotoIndex, updatedList.length - 1)));
      } else if (type === 'video') {
        setCurrentVideoIndex(Math.max(0, Math.min(currentVideoIndex, updatedList.length - 1)));
      }
    }
  };

  const handleSave = async () => {
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

      const blockResponse = await fetch(`${apiUrl}/api/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!blockResponse.ok) {
        const errText = await blockResponse.text();
        throw new Error(
          `Failed to update block: ${blockResponse.status} – ${errText}`
        );
      }

      const uploadMedia = async (field, list) => {
        const newFiles = list.filter((f) => !f.isExisting);

        if (newFiles.length === 0) {
          return;
        }

        const formData = new FormData();
        newFiles.forEach((f) => {
          if (f.file) {
            formData.append(field, f.file);
          }
        });

        if ([...formData.keys()].length === 0) {
          return;
        }

        const resp = await fetch(
          `${apiUrl}/api/blocks/${blockId}/${field}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(
            `Failed to upload ${field}: ${resp.status} – ${errText}`
          );
        }
      };

      await Promise.all([
        uploadMedia("photos", photos),
        uploadMedia("videos", videos),
        uploadMedia("files", otherFiles),
      ]);

      navigate("/");
    } catch (e) {
      alert("Ошибка сохранения: " + e.message);
    }
  };

  const handleDeleteBlock = async () => {
    if (!window.confirm("Удалить блок навсегда?")) return;
    const resp = await fetch(`${apiUrl}/api/blocks/${blockId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (resp.ok) {
      navigate("/blocks/select");
    } else {
      alert(`Ошибка удаления блока: ${resp.status}`);
    }
  };

  if (isLoading) return <div className="loading">Загрузка…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <MenuSection />
      <div className="add-block-page">
        <Header title="Редактирование блока" />
        <button
          onClick={() => handleDeleteBlock()}
          className="edit-page-delete-button"
        >
          Удалить
        </button>
        <div className="container">
          <Language
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
            languages={languages}
            onChange={(lang, field, val) =>
              setLanguages((prev) => ({
                ...prev,
                [lang]: { ...prev[lang], [field]: val },
              }))
            }
          />

          <div className="parent-select-group">
            <label htmlFor="parent-select">Родительский блок:</label>
            <select
              id="parent-select"
              className="parent-select"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              <option value="">Оставить без изменений</option>
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

          <button className="save-button" onClick={handleSave}>
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBlockPage;