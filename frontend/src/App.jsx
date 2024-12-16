/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPressReleaseIds, fetchPressReleaseById, savePressReleaseMarkdown, savePressReleasePlain } from './API';

function App() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pressReleaseList, setPressReleaseList] = useState([]);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [originalMarkdown, setOriginalMarkdown] = useState('');
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // New states for plain content
  const [originalPlain, setOriginalPlain] = useState('');
  const [editedPlain, setEditedPlain] = useState('');
  const [isEditingPlain, setIsEditingPlain] = useState(false);

  const loadPressRelease = (releaseId) => {
    setError('');
    fetchPressReleaseById(releaseId)
      .then(doc => {
        if (doc && doc._id) {
          setTitle(doc.title || '');
          setDatePublished(doc.date_published || '');
          const md = doc.content?.markdown || '';
          setOriginalMarkdown(md);
          setEditedMarkdown(md);
          setIsEditing(false);

          // Load plain content
          const pl = doc.content?.plain || '';
          setOriginalPlain(pl);
          setEditedPlain(pl);
          setIsEditingPlain(false);

        } else {
          setError('Press release not found.');
        }
      })
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    if (id) {
      if (pressReleaseList.length === 0) {
        fetchPressReleaseIds()
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setPressReleaseList(data);
              loadPressRelease(id);
            } else {
              setError('No press releases found.');
            }
          })
          .catch(err => setError(err.message));
      } else {
        loadPressRelease(id);
      }
    } else {
      fetchPressReleaseIds()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPressReleaseList(data);
            navigate(`/${data[0].id}`, { replace: true });
          } else {
            setError('No press releases found.');
          }
        })
        .catch(err => setError(err.message));
    }
  }, [id, navigate, pressReleaseList.length]);

  const handleEdit = (e) => {
    setEditedMarkdown(e.target.value);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!id) return;
    savePressReleaseMarkdown(id, editedMarkdown)
      .then(data => {
        if (data.success) {
          setOriginalMarkdown(editedMarkdown);
          setIsEditing(false);
        } else {
          setError(data.error || 'Unknown error while saving');
        }
      })
      .catch(err => setError(err.message));
  };

  const handleCancel = () => {
    setEditedMarkdown(originalMarkdown);
    setIsEditing(false);
  };

  // Handlers for plain content
  const handlePlainEdit = (e) => {
    setEditedPlain(e.target.value);
    setIsEditingPlain(true);
  };

  const handlePlainSave = () => {
    if (!id) return;
    savePressReleasePlain(id, editedPlain)
      .then(data => {
        if (data.success) {
          setOriginalPlain(editedPlain);
          setIsEditingPlain(false);
        } else {
          setError(data.error || 'Unknown error while saving plain');
        }
      })
      .catch(err => setError(err.message));
  };

  const handlePlainCancel = () => {
    setEditedPlain(originalPlain);
    setIsEditingPlain(false);
  };

  let currentIndex = -1;
  if (id && pressReleaseList.length > 0) {
    currentIndex = pressReleaseList.findIndex(item => item.id === id);
  }

  const goNext = () => {
    if (currentIndex >= 0 && currentIndex < pressReleaseList.length - 1) {
      const nextId = pressReleaseList[currentIndex + 1].id;
      navigate(`/${nextId}`);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      const prevId = pressReleaseList[currentIndex - 1].id;
      navigate(`/${prevId}`);
    }
  };

  if (error) {
    return <div style={{ width: '60%', margin: 'auto', marginTop: '2rem' }}>Error: {error}</div>;
  }

  if (!id || currentIndex === -1) {
    return <div style={{ width: '60%', margin: 'auto', marginTop: '2rem' }}>Loading press releases...</div>;
  }

  return (
    <div style={{ width: '60%', margin: 'auto', marginTop: '2rem' }}>
      <h1>Markdown Editor 3000</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={goPrevious} disabled={currentIndex <= 0}>Previous</button>
        <span style={{ margin: '0 1rem' }}>
          {currentIndex + 1} / {pressReleaseList.length}
        </span>
        <button onClick={goNext} disabled={currentIndex === pressReleaseList.length - 1}>Next</button>
      </div>

      <h2>{title}</h2>
      <p><em>{datePublished}</em></p>

      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
        <ReactMarkdown>{editedMarkdown}</ReactMarkdown>
      </div>

      <h2>Edit Markdown</h2>
      <textarea
        value={editedMarkdown}
        onChange={handleEdit}
        style={{ width: '100%', height: '400px', marginBottom: '1rem' }}
      ></textarea>

      <div>
        <button onClick={handleSave} style={{ marginRight: '1rem' }} disabled={!isEditing}>
          Save
        </button>
        <button onClick={handleCancel} disabled={!isEditing}>
          Cancel
        </button>
      </div>

      <h2>Edit Plain Text</h2>
      <textarea
        value={editedPlain}
        onChange={handlePlainEdit}
        style={{ width: '100%', height: '400px', marginBottom: '1rem' }}
      ></textarea>

      <div>
        <button onClick={handlePlainSave} style={{ marginRight: '1rem' }} disabled={!isEditingPlain}>
          Save
        </button>
        <button onClick={handlePlainCancel} disabled={!isEditingPlain}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default App;
