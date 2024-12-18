import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/remove-background', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    setResult(URL.createObjectURL(blob));
  };

  return (
    <div>
      <h1>AI Background Remover</h1>
      <input type="file" onChange={uploadImage} />
      {result && <img src={result} alt="Background Removed" />}
    </div>
  );
}

export default App;
