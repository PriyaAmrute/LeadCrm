import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import Swal from 'sweetalert2';

const Templates = () => {
  const [templates, setTemplates] = useState([
    "Hi, Good Morning",
    "Hi, Good Afternoon",
    "Hi, Good Evening"
  ]);

  const handleAddTemplate = async () => {
    const { value } = await Swal.fire({
      title: "Create Template",
      input: "text",
      inputLabel: "Template Text",
      inputPlaceholder: "Enter template text",
      showCancelButton: true
    });
    if (value) {
      setTemplates([...templates, value]);
      Swal.fire("Added!", "Template added successfully", "success");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Templates</h2>
        <Button onClick={handleAddTemplate} variant="primary">
          ➕ Add Template
        </Button>
      </div>
      <div className="row">
        {templates.map((tpl, idx) => (
          <div className="col-12 col-md-4 mb-3" key={idx}>
            <Card className="h-100 shadow">
              <Card.Body>
                <Card.Title>Template {idx + 1}</Card.Title>
                <Card.Text>{tpl}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
