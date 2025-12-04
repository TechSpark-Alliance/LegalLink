import React, { useEffect, useState } from "react";
import "./UserManagement.css";
import AdminLayout from "./AdminLayout";

const API_BASE = import.meta.env.VITE_APP_API || "http://localhost:8000/api/v1";
const ADMIN_BASE = `${API_BASE}/auth/admin`;

const statusLabel = (status) => {
  if (!status) return "Pending";
  if (status.is_active === false) return "Inactive";
  return status.is_verified ? "Verified" : "Pending";
};

export default function UserManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (role) params.append("role", role);
    if (status) params.append("status", status);
    if (q) params.append("q", q);
    const res = await fetch(`${ADMIN_BASE}/users?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status, page]);

  const act = async (url, method = "POST") => {
    setLoading(true);
    await fetch(url, { method });
    fetchUsers();
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout
      title="User Management"
      subtitle="Search, verify, and control client and lawyer accounts"
    >
      <div className="admin-users">
        <div className="admin-users__filters admin-surface">
          <input
            placeholder="Search name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          />
          <select value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }}>
            <option value="">All roles</option>
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
          </select>
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
            <option value="">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={() => { setPage(1); fetchUsers(); }}>Apply</button>
        </div>

        {loading ? <div className="admin-users__loading">Loading...</div> : (
          <div className="admin-users__list">
            {items.map((u) => (
              <div key={u._id || u.id} className="admin-users__card admin-surface">
                <div className="admin-users__top">
                  <div>
                    <div className="name">{u.full_name}</div>
                    <div className="meta">{u.email} · {u.role}</div>
                    <div className="meta">Status: {statusLabel(u.status)}</div>
                    {u.role === "lawyer" && (
                      <div className="tags">
                        {(u.expertise || []).map((ex) => <span key={ex} className="tag">{ex}</span>)}
                        {u.state && <span className="tag muted">{u.state}</span>}
                        {u.city && <span className="tag muted">{u.city}</span>}
                      </div>
                    )}
                  </div>
                  <div className="admin-users__actions">
                    {u.role === "lawyer" && !(u.status && u.status.is_verified) && (
                      <button className="btn green" onClick={() => act(`${ADMIN_BASE}/users/${u._id || u.id}/verify`)}>Verify</button>
                    )}
                    {u.status && u.status.is_active === false ? (
                      <button className="btn blue" onClick={() => act(`${ADMIN_BASE}/users/${u._id || u.id}/activate`)}>Activate</button>
                    ) : (
                      <button className="btn gray" onClick={() => act(`${ADMIN_BASE}/users/${u._id || u.id}/deactivate`)}>Deactivate</button>
                    )}
                    <button className="btn red" onClick={() => act(`${ADMIN_BASE}/users/${u._id || u.id}`, "DELETE")}>Delete</button>
                  </div>
                </div>
                <div className="admin-users__foot">
                  Created: {u.created_at?.slice(0, 10) || "—"} · Last login: {u.status?.last_login || "—"}
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="empty admin-text-muted">No users found.</div>}
          </div>
        )}

        <div className="admin-users__pager admin-surface">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </AdminLayout>
  );
}
