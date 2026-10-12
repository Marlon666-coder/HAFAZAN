import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../navigation/navItems";
import { useAppStore } from "../../state/appStore";
import styles from "./AppLayout.module.css";

export function AppLayout({ children }: { children: ReactNode }) {
  const { storageWarning } = useAppStore();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Navigasi utama">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            ح
          </span>
          <div>
            <strong className={styles.brandName}>HAFAZAN</strong>
            <span className={styles.brandTag}>Jaga Hafalan</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <item.icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <p className={styles.footerNote}>Data tersimpan lokal di peramban Anda.</p>
      </aside>

      <div className={styles.main}>
        {storageWarning && (
          <div className={styles.warning} role="alert">
            {storageWarning}
          </div>
        )}
        <main className={styles.content}>{children}</main>
      </div>

      <nav className={styles.bottomNav} aria-label="Navigasi bawah">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `${styles.bottomLink} ${isActive ? styles.active : ""}`}
          >
            <item.icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
