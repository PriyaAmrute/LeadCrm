import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';



const LeadManager = () => {
  const [leads, setLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    
    source: 'Manual',
    status: 'New',
    leadDate: '',
    remarks: '',
    template: '',
    followUpDate: ''
  });
  const [editLead, setEditLead] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [templates] = useState([
    "Hi, Good Morning",
    "Hi, Good Afternoon",
    "Hi, Good Evening"
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const fetchLeads = async () => {
    const res = await axios.get('http://localhost:8081/api/leads');
    setLeads(res.data.Leads || []);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/api/leads/add', form);
      setShowAddModal(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        source: 'Manual',
        status: 'New',
        leadDate: '',
        remarks: '',
        template: '',
        followUpDate: ''
      });
      fetchLeads();
      Swal.fire('Success', 'Lead added successfully', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to add lead', 'error');
    }
  };



  const deleteLead = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this lead?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (confirm.isConfirmed) {
      await axios.delete(`http://localhost:8081/api/leads/${id}`);
      fetchLeads();
      Swal.fire('Deleted!', 'Lead has been deleted.', 'success');
    }
  };
const handleExportImage = async () => {
  const canvas = await html2canvas(tableRef.current);
  const link = document.createElement('a');
  link.download = `leads_image_${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
};

const tableRef = useRef();

const handleExportPDF = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role !== 'superadmin') {
    return Swal.fire('Upgrade', 'This feature is for premium users', 'info');
  }

  const canvas = await html2canvas(tableRef.current);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  pdf.save(`leads_${Date.now()}.pdf`);
};

const handleExportExcel = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role !== 'superadmin') {
    return Swal.fire('Upgrade', 'This feature is for premium users', 'info');
  }

  const wb = XLSX.utils.book_new();
  const wsData = leads.map(({ name, email, phone, source, status, leadDate, followUpDate, remarks }) => ({
    Name: name,
    Email: email,
    Phone: phone,
    Source: source,
    Status: status,
    LeadDate: leadDate,
    FollowUpDate: followUpDate,
    Remarks: remarks
  }));
  const ws = XLSX.utils.json_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
};

  const handleEditClick = (lead) => {
    setEditLead(lead);
    setShowEditModal(true);
  };

  const handleUpdateLead = async () => {
    const { id, name, email, phone, source, status, leadDate, remarks, followUpDate } = editLead;
    await axios.put(`http://localhost:8081/api/leads/${id}`, {
      name,
      email,
      phone,
      source,
      status,
      leadDate,
      remarks,
      followUpDate
    });
    setShowEditModal(false);
    fetchLeads();
    Swal.fire('Updated', 'Lead updated successfully', 'success');
  };

  const handleWhatsAppShare = (lead) => {
    const message = `Lead Details:%0AName: ${lead.name}%0AEmail: ${lead.email}%0APhone: ${lead.phone}%0AStatus: ${lead.status}%0ARemarks: ${lead.remarks || '-'}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("http://yourcrmurl.com")}`;
    window.open(fbUrl, '_blank');
  };

  const handleTalkToCustomer = async (lead) => {
    const { value: templateIndex } = await Swal.fire({
      title: 'Talk to Customer',
      input: 'select',
      inputOptions: templates.reduce((acc, tpl, idx) => {
        acc[idx] = tpl;
        return acc;
      }, {}),
      inputPlaceholder: 'Select a template',
      showCancelButton: true
    });

    if (templateIndex !== undefined && templateIndex !== null) {
      const selectedTemplate = templates[templateIndex];
      const phoneWithCountryCode = `91${lead.phone}`;
      window.open(`https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(selectedTemplate)}`, '_blank');
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesName = lead.name.toLowerCase().includes(search.name.toLowerCase());
    const matchesEmail = lead.email.toLowerCase().includes(search.email.toLowerCase());
    const matchesPhone = lead.phone.includes(search.phone);
    const matchesSearchStatus = search.status ? lead.status.toLowerCase().includes(search.status.toLowerCase()) : true;
    const matchesStartDate = search.startDate ? new Date(lead.leadDate) >= new Date(search.startDate) : true;
    const matchesEndDate = search.endDate ? new Date(lead.leadDate) <= new Date(search.endDate) : true;
    return (
      matchesName &&
      matchesEmail &&
      matchesPhone &&
      matchesSearchStatus &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const indexOfLast = currentPage * leadsPerPage;
  const indexOfFirst = indexOfLast - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  return (
    <div className="container mt-4">
      {/* summary counters */}
      <div className="row mb-3">
        {["New", "Follow-Up", "Closed"].map(status => (
          <div className="col" key={status}>
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-0">{status}</h6>
                <span className={`badge fs-6 ${status === 'New' ? 'bg-primary' : status === 'Follow-Up' ? 'bg-warning text-dark' : 'bg-success'}`}>
                  {leads.filter(l => l.status === status).length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* search filters */}
      <div className="row mb-3">
        <div className="col">
          <input className="form-control" placeholder="Search Name" value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        </div>
        <div className="col">
          <input className="form-control" placeholder="Search Email" value={search.email} onChange={(e) => setSearch({ ...search, email: e.target.value })} />
        </div>
        <div className="col">
          <input className="form-control" placeholder="Search Phone" value={search.phone} onChange={(e) => setSearch({ ...search, phone: e.target.value })} />
        </div>
        <div className="col">
          <select className="form-control" value={search.status} onChange={(e) => setSearch({ ...search, status: e.target.value })}>
            <option value="">All Status</option>
            <option>New</option>
            <option>Follow-Up</option>
            <option>Closed</option>
          </select>
        </div>
        <div className="col">
          <input type="date" className="form-control" value={search.startDate} onChange={(e) => setSearch({ ...search, startDate: e.target.value })} />
        </div>
        <div className="col">
          <input type="date" className="form-control" value={search.endDate} onChange={(e) => setSearch({ ...search, endDate: e.target.value })} />
        </div>
      </div>

      {/* controls */}
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h2>Lead Management</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>➕ Add Lead</button>
          <button className="btn btn-secondary" onClick={() => setViewMode('table')}>Table View</button>
          <button className="btn btn-secondary" onClick={() => setViewMode('card')}>Card View</button>
          <button className="btn btn-outline-info" onClick={handleExportImage}>🖼️ Export Image</button>
<button className="btn btn-outline-success" onClick={handleExportPDF}>📄 Export PDF</button>
<button className="btn btn-outline-warning" onClick={handleExportExcel}>📊 Export Excel</button>

        </div>
      </div>

      {/* table view */}
      {viewMode === 'table' && (
        <div className="table-responsive">
  <table className="table table-bordered" ref={tableRef}>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Source</th> {/* added source column */}
        <th>Status</th>
        <th>Lead Date</th>
        <th>Follow Up</th>
        <th>Remarks</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentLeads.map((lead, index) => (
        <tr key={lead.id}>
       <td>
{(() => {
  const date = new Date(lead.leadDate || new Date());
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Asia/Kolkata"
  };
  const parts = new Intl.DateTimeFormat("en-IN", options)
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
  const mm = parts.month;
  const dd = parts.day;
  const yy = parts.year;
  return `${mm}${dd}${yy}${lead.id}`;
})()}


</td>

          <td>{lead.name}</td>
          <td>{lead.email}</td>
          <td>{lead.phone}</td>
          <td>{lead.source}</td> {/* display the source value */}
          <td>
            <span
              className={`badge ${
                lead.status === 'New'
                  ? 'bg-primary'
                  : lead.status === 'Follow-Up'
                  ? 'bg-warning text-dark'
                  : 'bg-success'
              }`}
            >
              {lead.status}
            </span>
          </td>
         <td>
  {lead.leadDate
    ? new Date(lead.leadDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata"
      })
    : '-'
  }
</td>

         <td>
  {lead.followUpDate
    ? new Date(lead.followUpDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata"
      })
    : '-'
  }
</td>

          <td>{lead.remarks || '-'}</td>
          <td className="d-flex flex-wrap gap-1">
            <button
              className="btn btn-outline-warning btn-sm"
              onClick={() => handleEditClick(lead)}
              title="Update Lead"
            >
              <i className="bi bi-pencil-square"></i>
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => deleteLead(lead.id)}
              title="Delete Lead"
            >
              <i className="bi bi-trash"></i>
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleWhatsAppShare(lead)}
              title="Forward the Lead on WhatsApp"
            >
              <i className="bi bi-whatsapp"></i>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleFacebookShare}
              title="Share on Facebook"
            >
              <i className="bi bi-facebook"></i>
            </button>
            <button
              className="btn btn-dark btn-sm"
              onClick={() => handleTalkToCustomer(lead)}
              title="Connect with Client"
            >
              <i className="bi bi-chat-dots"></i>
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      )}

      {/* card view */}
      {viewMode === 'card' && (
        <div className="row">
          {currentLeads.map((lead) => (
            <div className="col-md-4 mb-3" key={lead.id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{lead.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{lead.email}</h6>
                  <p>
                    <strong>Phone:</strong> {lead.phone}<br/>
                    <strong>Status:</strong>
                    <span className={`badge ms-1 ${lead.status === 'New' ? 'bg-primary' : lead.status === 'Follow-Up' ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {lead.status}
                    </span><br/>
                    <strong>Lead Date:</strong> {lead.leadDate || '-'}<br/>
                    <strong>Follow Up Date:</strong> {lead.followUpDate || '-'}<br/>
                    <strong>Remarks:</strong> {lead.remarks || '-'}
                  </p>
                 <div className="d-flex flex-wrap gap-1">
  <button className="btn btn-outline-warning btn-sm" onClick={() => handleEditClick(lead)} title="Update Lead">
    <i className="bi bi-pencil-square"></i>
  </button>
  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteLead(lead.id)} title="Delete Lead">
    <i className="bi bi-trash"></i>
  </button>
  <button className="btn btn-success btn-sm" onClick={() => handleWhatsAppShare(lead)} title="Forward the Lead on WhatsApp">
    <i className="bi bi-whatsapp"></i>
  </button>
  <button className="btn btn-primary btn-sm" onClick={handleFacebookShare} title="Share on Facebook">
    <i className="bi bi-facebook"></i>
  </button>
  <button className="btn btn-dark btn-sm" onClick={() => handleTalkToCustomer(lead)} title="Connect with Client">
    <i className="bi bi-chat-dots"></i>
  </button>
</div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add Lead</Modal.Title></Modal.Header>
   <Modal.Body>
  <form onSubmit={handleSubmit}>
    <input
      className="form-control mb-2"
      placeholder="Name"
      value={form.name}
      onChange={e => setForm({...form, name: e.target.value})}
      required
    />
    <input
      className="form-control mb-2"
      placeholder="Email"
      value={form.email}
      onChange={e => setForm({...form, email: e.target.value})}
      required
    />
    <PhoneInput
      
  country={'in'} // default to India
  value={form.phone}
  onChange={phone => setForm({ ...form, phone })}
  inputClass="form-control mb-2 w-100 "
/>
<br />
    <label className="form-label">Lead Modification Date</label>
    <input
      type="date"
      className="form-control mb-2"
      value={form.leadDate}
      placeholder="Lead Modification Date"
      onChange={e => setForm({...form, leadDate: e.target.value})}
    />
    {/* removed follow-up date here as you wanted */}
    <select
      className="form-control mb-2"
      value={form.status}
      onChange={e => setForm({...form, status: e.target.value})}
    >
      <option value="New">New</option>
      <option value="Follow-Up">Follow-Up</option>
      <option value="Closed">Closed</option>
    </select>
   <select
  className="form-control mb-2"
  value={form.source}
  onChange={e => setForm({ ...form, source: e.target.value })}
>
  <option value="Manual">Manual</option>
  <option value="Facebook">Facebook</option>
  <option value="Instagram">Instagram</option>
  <option value="Google Ads">Google Ads</option>
  <option value="Referral">Referral</option>
  <option value="Website">Website</option>
</select>


    <textarea
      className="form-control mb-2"
      placeholder="Remarks"
      value={form.remarks}
      onChange={e => setForm({...form, remarks: e.target.value})}
    ></textarea>
    <select
      className="form-control mb-2"
      value={form.template}
      onChange={e => setForm({...form, template: e.target.value})}
    >
      <option value="">Select Template</option>
      {templates.map((tpl, idx) => <option key={idx}>{tpl}</option>)}
    </select>
    <Button type="submit" variant="primary" className="w-100">Add Lead</Button>
  </form>
</Modal.Body>


      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Lead</Modal.Title></Modal.Header>
<Modal.Body>
  {editLead && (
    <>
      <input className="form-control mb-2" value={editLead.name} disabled />
      <input className="form-control mb-2" value={editLead.email} disabled />
<PhoneInput  
  country={'in'}
  value={editLead.phone}
  onChange={phone => setEditLead({ ...editLead, phone })}
inputClass="form-control mb-2 w-100 "
/>

      
      <label className="form-label">Lead Modification Date</label>
      <input
        type="date"
        className="form-control mb-2"
        value={editLead.leadDate || ''}
        placeholder="Lead Modification Date"
        onChange={e => setEditLead({...editLead, leadDate: e.target.value})}
        disabled/>
      <label className="form-label">Lead follow Up Date Date</label>
      <input
        type="date"
        className="form-control mb-2"
        value={editLead.followUpDate || ''}
        placeholder="Follow Up Date"
        onChange={e => setEditLead({...editLead, followUpDate: e.target.value})}
    />
      <textarea
        className="form-control mb-2"
        placeholder="Remarks"
        value={editLead.remarks || ''}
        onChange={e => setEditLead({...editLead, remarks: e.target.value})}
      ></textarea>
      <select
  className="form-control mb-2"
  value={editLead.source}
  onChange={e => setEditLead({ ...editLead, source: e.target.value })}
>
  <option value="Manual">Manual</option>
  <option value="Facebook">Facebook</option>
  <option value="Instagram">Instagram</option>
  <option value="Google Ads">Google Ads</option>
  <option value="Referral">Referral</option>
  <option value="Website">Website</option>
</select>

   <select
  className="form-control mb-2"
  value={editLead.status}
  onChange={e => setEditLead({ ...editLead, status: e.target.value })}
>
  <option>New</option>
  <option>Follow-Up</option>
  <option>Closed</option>
  <option>Pending from our side</option>
  <option>Pending from customer side</option>
</select>

    </>
  )}
</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateLead}>Update</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeadManager;
