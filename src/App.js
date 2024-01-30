import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';
import LoginPage from './LoginPage';

const firebaseConfig = {
  apiKey: "AIzaSyDTxc4nVZunx4IQKfVGO2R_S3lnvI9UX9I",
  authDomain: "textcopy-e0e8b.firebaseapp.com",
  databaseURL: "https://textcopy-e0e8b-default-rtdb.firebaseio.com",
  projectId: "textcopy-e0e8b",
  storageBucket: "textcopy-e0e8b.appspot.com",
  messagingSenderId: "359360837627",
  appId: "1:359360837627:web:b223ee75a15688e962fd5e",
  measurementId: "G-VTBTWP26VL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const isImageContent = (content) => {
  return content.startsWith('data:image');
};

const Home = ({ user }) => {
  const [code, setCode] = useState('');
  const [texts, setTexts] = useState([]);
  const [copiedButtons, setCopiedButtons] = useState({});
  const [clickedButton, setClickedButton] = useState(null);
  const [downloadHovered, setDownloadHovered] = useState(null);

  useEffect(() => {
    if (!user) {
      setTexts([]);
      return;
    }

    const textsRef = ref(database, `texts/${user.uid}`);

    const unsubscribe = onValue(textsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const textsArray = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
        setTexts(textsArray);
      } else {
        setTexts([]);
      }
    });

    return () => unsubscribe();
  }, [database, user]);

  const saveToFirebase = async () => {
    if (!user || code.trim() === '') {
      return;
    }

    const newCodeName = window.prompt('Enter a name for the text:');
    if (!newCodeName) {
      return;
    }

    const existingFileName = texts.find((item) => item.name === newCodeName);
    if (existingFileName) {
      alert('A file with the same name already exists. Please choose a different name.');
      return;
    }

    const textsRef = ref(database, `texts/${user.uid}`);
    const newCodeRef = push(textsRef);

    try {
      await set(newCodeRef, { name: newCodeName, content: code });
    } catch (error) {
      console.error('Error saving to Firebase: ', error);
    }

    setCode('');
  };

  const handleCopyClick = (content, buttonId) => {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setCopiedButtons((prevButtons) => ({
      ...prevButtons,
      [buttonId]: true,
    }));

    setClickedButton(buttonId);

    setTimeout(() => {
      setCopiedButtons((prevButtons) => ({
        ...prevButtons,
        [buttonId]: false,
      }));
      setClickedButton(null);
    }, 2000);
  };

  const handleFileDownload = (content, fileName) => {
    const link = document.createElement('a');
    link.href = content;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHover = (isHovered, itemId) => {
    setDownloadHovered(isHovered ? itemId : null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;

      const newFileName = window.prompt('Enter a name for the file:');
      if (!newFileName) {
        return;
      }

      const existingFileName = texts.find((item) => item.name === newFileName);
      if (existingFileName) {
        alert('A file with the same name already exists. Please choose a different name.');
        return;
      }

      const textsRef = ref(database, `texts/${user.uid}`);
      const newFileRef = push(textsRef);

      try {
        await set(newFileRef, { name: newFileName, content: fileContent });
      } catch (error) {
        console.error('Error saving file to Firebase: ', error);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleViewClick = (content, fileName) => {
    const viewerWindow = window.open('', '_blank');
    const viewerDocument = viewerWindow.document;

    if (isImageContent(content)) {
      const imgElement = viewerDocument.createElement('img');
      imgElement.src = content;
      imgElement.alt = fileName;
      viewerDocument.title = fileName;
      viewerDocument.body.appendChild(imgElement);
    } else {
      viewerWindow.location.href = content;
    }
  };

  return (
    <div className="container">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Drop Here"
        className="code-input"
      />
      <br />
      <br />
      <button onClick={saveToFirebase} className="button-style" title="Export">
        <Link
          to=""
          className="export-link"
          style={{ textDecoration: 'none', color: 'black' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </Link>
      </button>
      <button>
        <label htmlFor="file-upload" className="button-style" title="Upload File" style={{ cursor: 'pointer' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="purple"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="8" x2="8" y2="8"></line>
            <line x1="16" y1="12" x2="8" y2="12"></line>
            <line x1="16" y1="16" x2="8" y2="16"></line>
          </svg>
        </label>
      </button>
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <div className="codes-container">
        {texts.map((item) => (
          <div key={item.id} className="code-item">
            <pre className="code-display">{item.name}</pre>
            {item.content.startsWith('data:') ? (
              <>
                <button
                  onMouseEnter={() => handleDownloadHover(true, item.id)}
                  onMouseLeave={() => handleDownloadHover(false, item.id)}
                  onClick={() => handleFileDownload(item.content, item.name)}
                  className={`download-button ${downloadHovered === item.id ? 'hovered' : ''}`}
                  title="Download"
                >
                  <svg
                    id={`download-icon-${item.id}`}
                    className={`download-icon ${downloadHovered === item.id ? 'hovered' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="35"
                    height="30"
                    fill="none"
                    stroke="red"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
                  </svg>
                </button>
                {isImageContent(item.content) && (
                  <button
                    onClick={() => handleViewClick(item.content, item.name)}
                    className="view-button"
                    title="View"
                  >
                    View
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => handleCopyClick(item.content, item.id)}
                className={`copy-button ${clickedButton === item.id ? 'clicked' : ''}`}
                title="Click to Copy"
              >
                {copiedButtons[item.id] ? (
                  <span role="img" aria-label="tick-mark" style={{ marginRight: '5px' }}>
                    ✔️
                  </span>
                ) : (
                  'COPY'
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user) {
      alert('YOU WILL BE LOGGED OUT');
      
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error logging out: ', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? (
            <>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
              <Home user={user} />
            </>
          ) : (
            <LoginPage />
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
