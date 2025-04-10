import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ndjsonStream from 'can-ndjson-stream';

function App() {
  const [list, setList] = useState([])

  const fetchNdjson = async (): Promise<void> => {
    const response = await fetch('https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log');
    const ndjson = ndjsonStream(response.body);
    const reader = ndjson.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      console.log(value);
      setList((prevList) => [...prevList, value])


    }

    reader.releaseLock();
  };

  useEffect(() => {
    fetchNdjson();
  }, []);

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
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {list?.length}
        </button>
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
                    <tr
                      key={index}

                    >
                      <td>{new Date(item._time).toISOString()}</td>
                      <td>
                        <code>
                          {JSON.stringify(item)}
                        </code>
                      </td>
                    </tr>
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
