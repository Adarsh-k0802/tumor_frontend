import React, { useState } from 'react';
import axios from 'axios';
import "./App.css"

const App = () => {
  const [file, setFile] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    dob: '',
    age: '',
    diagnosisDateTime: new Date().toISOString().slice(0, 16), // Current date and time in ISO format
  });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo({ ...patientInfo, [name]: value });
    if (name === 'dob') {
      calculateAge(value);
    }
  };

  const calculateAge = (dob) => {
    const dobDate = new Date(dob);
    const currentDate = new Date();
    const ageDate = new Date(currentDate - dobDate);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    setPatientInfo({ ...patientInfo, age: calculatedAge.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload an MRI image.');
      return;
    } else {
      setError('');
    }

    const formData = new FormData();
    formData.append('file', file);
    for (const key in patientInfo) {
      formData.append(key, patientInfo[key]);
    }

    try {
      const response = await axios.post('https://tumor-backend.onrender.com/predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data.predicted_label);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePrint = () => {
    // Format date of birth
    const dob = new Date(patientInfo.dob).toLocaleDateString();
  
    const printableContent = `
      <h1 class="text-center">Medical Report</h1>
      <div class="container">
        <div class="row">
          <div class="col">
            <h2 style="text-align: left;">Patient Information</h2>
            <p><strong>Name:</strong> ${patientInfo.name}</p>
            
            <p><strong>Age:</strong> ${patientInfo.age}</p>
          </div>
          <div class="col">
            <h2 style="text-align: left;">Diagnosis Information</h2>
            <p><strong>Date & Time of Diagnosis:</strong> ${patientInfo.diagnosisDateTime}</p>
            <p><strong>Detected Tumor:</strong> ${result}</p>
          </div>
        </div>
      </div>
    `;
  
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Medical Report</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1, h2, h3 {
              color: #007bff;
              text-align: center;
            }
            p {
              margin-bottom: 0.5rem;
            }
          </style>
        </head>
        <body>
          ${printableContent}
          <script>
            window.onload = function() { 
              window.print(); 
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="container mt-3">
        <h3 className="text-center text-light mb-4">Patient Information</h3>
        <form onSubmit={handleSubmit}>
          <div className="row jumbotron box8">
            <div className="col-sm-12 mx-t3 mb-4">
              <h2 className="text-center text-info">Patient Information</h2>
            </div>
            <div className="col-sm-6 form-group mb-4">
              <label htmlFor="name">Patient Name</label>
              <input type="text" className="form-control" name="name" id="name" placeholder="Enter patient name" required onChange={handleInputChange} />
            </div>
            <div className="col-sm-6 form-group mb-4">
              <label htmlFor="dob">Date of Birth</label>
              <input type="date" className="form-control" name="dob" id="dob" required onChange={handleInputChange} />
            </div>
            <div className="col-sm-6 form-group mb-4">
              <label htmlFor="age">Age</label>
              <input type="number" className="form-control" name="age" id="age" placeholder="Enter patient age" value={patientInfo.age} readOnly />
            </div>
            <div className="col-sm-6 form-group mb-4">
              <label htmlFor="diagnosisDateTime">Diagnosis Date & Time</label>
              <input type="datetime-local" className="form-control" name="diagnosisDateTime" id="diagnosisDateTime" value={patientInfo.diagnosisDateTime} readOnly />
            </div>
            <div className="col-sm-12 form-group mb-4">
              <label htmlFor="mriImage">Upload MRI Image</label>
              <input type="file" className="form-control-file" id="mriImage" onChange={handleFileChange} required />
              {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>
            <div className="col-sm-12 form-group mb-4 text-center">
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </div>
        </form>
      </div>

      {result && (
        <div className="mt-4 text-center">
          <h2 className="text-center text-primary font-weight-bold" style={{ marginTop: '2rem' }}>Result</h2>
          <p className="text-center">You have been diagnosed with <b>{result}</b> tumor in your brain.</p>
          <button className="btn btn-danger mt-3" onClick={handlePrint}>Print Report</button>
        </div>
      )}
    </div>
  );
};

export default App;
