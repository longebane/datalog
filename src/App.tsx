import { useEffect, useState } from 'react';
import { openDB, deleteDB, IDBPDatabase } from 'idb';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ndjsonStream from 'can-ndjson-stream';
import { DataItem } from './types'; // Import DataItem type

function App() {
  const [list, setList] = useState<DataItem[]>([]); // State for the list of data
  const [expandedRow, setExpandedRow] = useState<number | null>(null); // Track expanded row

  // Initialize IndexedDB
  const initDB = async (): Promise<IDBPDatabase> => {
    return openDB('streamedDataDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  };

  const fetchNdjson = async (): Promise<void> => {
    const db = await initDB();
    const response = await fetch('https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log');
    const ndjson = ndjsonStream(response.body);
    const reader = ndjson.getReader();
    let id = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // Save each chunk to IndexedDB
      await db.put('data', { id: id++, ...value });

      // Load the latest data from IndexedDB
      const allData = await db.getAll('data');
      setList(allData.map((entry) => entry as DataItem)); // Update the UI with the latest data
    }

    reader.releaseLock();
  };

  useEffect(() => {
    fetchNdjson();

    // Cleanup function to delete IndexedDB on app close
    const cleanup = () => {
      deleteDB('streamedDataDB'); // Delete the database
    };

    window.addEventListener('beforeunload', cleanup); // Listen for app close or reload

    return () => {
      window.removeEventListener('beforeunload', cleanup); // Cleanup the event listener
    };
  }, []);

  const handleRowExpand = (index: number): void => {
    setExpandedRow((prev) => (prev === index ? null : index)); // Toggle expanded row
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + IndexedDB</h1>
      <div className="card">
        <button>Count is {list?.length}</button>

        {list?.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <>
                  {expandedRow !== index ? (
                    <tr
                      key={item._time}
                      onClick={() => handleRowExpand(index)}
                      className={expandedRow === index ? 'expanded-row' : ''}
                    >
                      <td>{new Date(item._time).toISOString()}</td>
                      <td>
                        <code>
                          {JSON.stringify(item)}
                        </code>
                      </td>
                    </tr>
                  ) : (
                    <tr key={`expanded-${index}`} onClick={() => handleRowExpand(index)} className="expanded-content">
                      <td colSpan={2}>
                        {new Date(item._time).toISOString()}
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0 }}>
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default App;
