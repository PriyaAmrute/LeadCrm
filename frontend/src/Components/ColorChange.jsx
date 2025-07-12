import React, { useEffect, useState } from 'react';

function ColorChange() {
  const [color, setColor] = useState('#0d6efd');

  // color apply helper
  const applyColor = (newColor) => {
    document.documentElement.style.setProperty('--theme-color', newColor);

    // brightness calculation
    const c = newColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    if (brightness > 180) {
      document.documentElement.style.setProperty('--theme-text-color', '#000000');
    } else {
      document.documentElement.style.setProperty('--theme-text-color', '#ffffff');
    }
  };

  useEffect(() => {
    const storedColor = localStorage.getItem('themeColor');
    if (storedColor) {
      setColor(storedColor);
      applyColor(storedColor);
    } else {
      applyColor(color);
    }
  }, []);

  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    localStorage.setItem('themeColor', newColor);
    applyColor(newColor);
  };

  return (
    <div className="container mt-4">
      <h3>Change Theme Color</h3>
      <div className="mb-3">
        <label>Select Color:</label>
        <input
          type="color"
          className="form-control form-control-color"
          value={color}
          onChange={handleChange}
          style={{ width: '80px', height: '40px', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}

export default ColorChange;
