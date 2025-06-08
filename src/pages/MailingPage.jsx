import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Language from '../components/Language';
import Photos from '../components/Photos';
import Videos from '../components/Videos';
import OtherFiles from '../components/OtherFiles';
import MenuSection from '../components/MenuSection';
import './PagesStyle.css';

const Mailing = () => {
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

  const handleSaveBroadcast = async () => {
    if (!languages.ru.content && !languages.en.content &&
        !languages.zh.content && !languages.ar.content &&
        photos.length === 0 && videos.length === 0 && otherFiles.length === 0) {
      alert('Пожалуйста, заполните хотя бы один язык или прикрепите медиафайл.');
      return;
    }

    try {
      const broadcastTranslations = Object.entries(languages)
        .filter(([, langData]) => langData.content)
        .map(([langCode, langData]) => ({
          language_code: langCode,
          title: "",
          content: langData.content
        }));

      const payload = {
        translations: broadcastTranslations,
      };

      const broadcastResponse = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!broadcastResponse.ok) {
        const errorText = await broadcastResponse.text();
        throw new Error(`Ошибка создания рассылки: ${broadcastResponse.status} - ${errorText}`);
      }
      const { id: broadcastId } = await broadcastResponse.json();

      const uploadMedia = async (type, files) => {
        if (files.length === 0) {
          return;
        }
        const formData = new FormData();
        files.forEach((f) => {
          formData.append(type, f.file);
        });

        const mediaResponse = await fetch(`/api/broadcasts/${broadcastId}/${type}`, {
          method: 'POST',
          body: formData
        });

        if (!mediaResponse.ok) {
          const errorText = await mediaResponse.text();
          throw new Error(`Ошибка загрузки ${type} для рассылки: ${mediaResponse.status} - ${errorText}`);
        }
      };

      await Promise.all([
        uploadMedia('photos', photos),
        uploadMedia('videos', videos),
        uploadMedia('files', otherFiles)
      ]);

      alert('Рассылка успешно создана!');
      navigate('/');
    } catch (error) {
      alert('Ошибка сохранения рассылки: ' + error.message);
    }
  };

  const handleLanguageChange = (lang, field, value) => {
    if (field === 'title') {
      return;
    }
    setLanguages(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  return (
    <div className="page">
      <MenuSection />
      <div className="add-block-page">
        <Header title="Создание рассылки" />

        <div className="container">

          <Language
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
            languages={languages}
            onChange={handleLanguageChange}
            isMailing={true}
          />

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

          <button className="save-button" onClick={handleSaveBroadcast}>
            Сохранить рассылку
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mailing;
