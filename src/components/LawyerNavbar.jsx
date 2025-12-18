import React, { useEffect, useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import styles from "./NavBar/NavBar.module.css";
import logo from "../assets/legal-link-logo.png";

const NAV_ITEMS = [
  { key: "cases", label: "Cases", path: "/lawyer/cases" },
  { key: "clients", label: "Clients", path: "/lawyer/clients" },
  { key: "appointments", label: "Appointments", path: "/lawyer/appointments" },
  { key: "conversations", label: "Conversations", path: "/lawyer/conversations" },
];

export default function LawyerNavbar({ activeKey = "cases" }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Profile");
  const apiBase = import.meta.env.VITE_APP_API || "http://localhost:8000/api/v1";

  useEffect(() => {
    let name = "";
    try {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const parsed = JSON.parse(storedUser);
        name = parsed?.full_name || parsed?.fullName || parsed?.email || "";
      }
    } catch (_) {
      /* ignore */
    }
    if (!name) {
      name = localStorage.getItem("full_name") || sessionStorage.getItem("full_name") || "Profile";
    }
    setUserName(name);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      if (token) {
        await fetch(`${apiBase}/auth/user/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      /* ignore */
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  return (
    <header className={styles.shell}>
      <div className={styles.brand} role="button" tabIndex={0} onClick={() => navigate("/lawyer/cases")}>
        <img src={logo} alt="LegalLink" className={styles.logo} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>LegalLink</span>
        </div>
      </div>
      <div className={styles.rightGroup}>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={`${styles.link} ${activeKey === item.key ? styles.active : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.profileWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.profileBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span className={styles.avatar}>{(userName || "P").charAt(0)}</span>
            <span className={styles.profileName}>{userName}</span>
          </button>
          <div className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`} role="menu">
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => navigate("/lawyer/profile")}
              role="menuitem"
            >
              Profile
            </button>
            <div className={styles.menuDivider} aria-hidden="true" />
            <button
              type="button"
              className={`${styles.menuItem} ${styles.signOut}`}
              onClick={handleLogout}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
