import React from "react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

interface SidebarProps {
  active: string;
  onSelect: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onSelect }) => {
  const buttons = [
    { key: "vender", label: "Vender" },
    { key: "compras", label: "Compras" },
    { key: "ideias", label: "Ideias" },
    { key: "historico", label: "Histórico" },
    { key: "dashboard", label: "Dashboard" },
  ];

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.title}>Título</h1>
      {buttons.map((btn) => (
        <button
          key={btn.key}
          onClick={() => onSelect(btn.key)}
          className={clsx(styles.navButton, {
            [styles.active]: active === btn.key,
          })}
        >
          {btn.label}
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
