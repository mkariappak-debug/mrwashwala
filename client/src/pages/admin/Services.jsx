import React, { useEffect, useState } from 'react';
import API from '../../api/api';

const emptyService = {
  id: '',
  name: '',
  unit: '',
  price: 0,
  features: '',
  featured: false,
  displayType: 'main',
  customizeCategory: '',
  customizeSubcategory: ''
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await API.get('/api/services');
        setServices(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const resetForm = () => {
    setForm(emptyService);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEditing) {
        const response = await API.put(`/api/services/${encodeURIComponent(form.id)}`, {
          name: form.name,
          unit: form.unit,
          price: Number(form.price),
          features: form.features.split(',').map((item) => item.trim()).filter(Boolean),
          featured: form.featured,
          displayType: form.displayType,
          customizeCategory: form.customizeCategory,
          customizeSubcategory: form.customizeSubcategory
        });
        // update local state with the returned updated service
        setServices((prev) => prev.map((service) => (service.id === form.id ? response.data : service)));
      } else {
        const response = await API.post('/api/services', {
          id: form.id,
          name: form.name,
          unit: form.unit,
          price: Number(form.price),
          features: form.features.split(',').map((item) => item.trim()).filter(Boolean),
          featured: form.featured,
          displayType: form.displayType,
          customizeCategory: form.customizeCategory,
          customizeSubcategory: form.customizeSubcategory
        });
        setServices((prev) => [response.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to save service');
    }
  };

  const handleEdit = (service) => {
    setForm({ ...service, features: (service.features || []).join(', ') });
    setIsEditing(true);
  };

  const handleDelete = async (serviceId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this service? This cannot be undone.');
      if (!confirmed) return;

      await API.delete(`/api/services/${encodeURIComponent(serviceId)}`);
      // Re-fetch services to ensure frontend state mirrors DB
      setLoading(true);
      try {
        const response = await API.get('/api/services');
        setServices(response.data || []);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to delete service');
    }
  };

  if (loading) {
    return <div className="admin-empty-state">Loading services…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__title">{isEditing ? 'Edit Service' : 'Add New Service'}</div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            className="admin-input"
            placeholder="Service ID"
            value={form.id}
            onChange={(event) => setForm({ ...form, id: event.target.value })}
            required
            disabled={isEditing}
          />
          <input
            className="admin-input"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="admin-input"
            placeholder="Unit"
            value={form.unit}
            onChange={(event) => setForm({ ...form, unit: event.target.value })}
            required
          />
          <input
            className="admin-input"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            required
          />
          <input
            className="admin-input"
            placeholder="Features (comma-separated)"
            value={form.features}
            onChange={(event) => setForm({ ...form, features: event.target.value })}
          />
          <select
            className="admin-select"
            value={form.displayType}
            onChange={(event) => setForm({ ...form, displayType: event.target.value })}
          >
            <option value="main">Main</option>
            <option value="customize">Customize</option>
          </select>
          {form.displayType === 'customize' && (
            <>
              <input
                className="admin-input"
                placeholder="Customize Category"
                value={form.customizeCategory}
                onChange={(event) => setForm({ ...form, customizeCategory: event.target.value })}
              />
              <input
                className="admin-input"
                placeholder="Customize Subcategory"
                value={form.customizeSubcategory}
                onChange={(event) => setForm({ ...form, customizeSubcategory: event.target.value })}
              />
            </>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm({ ...form, featured: event.target.checked })}
            />
            Featured
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="admin-button">
              {isEditing ? 'Update Service' : 'Create Service'}
            </button>
            {isEditing && (
              <button type="button" className="admin-button" onClick={resetForm} style={{ background: '#64748b', color: '#fff' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card__title">Service Catalog</div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Display</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>{service.id}</td>
                <td>{service.name}</td>
                <td>{service.unit}</td>
                <td>₹{service.price.toFixed(2)}</td>
                <td>{service.displayType || 'main'}</td>
                <td>{service.customizeCategory || '-'}</td>
                <td>{service.customizeSubcategory || '-'}</td>
                <td>{service.featured ? 'Yes' : 'No'}</td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="admin-button" onClick={() => handleEdit(service)}>
                    Edit
                  </button>
                  <button type="button" className="admin-button" onClick={() => handleDelete(service.id)} style={{ background: '#ef4444', color: '#fff' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
