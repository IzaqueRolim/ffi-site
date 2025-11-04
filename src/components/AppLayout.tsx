import React, { useState } from "react";
import Sidebar from "./Sidebar";
import SalesTable from "./SalesTable";
import Purchases from "./Purchases";
import Ideas from "./Ideas";
import FloatingButton from "./FloatingButton";
import ModalForm from "./ModalForm";
import styles from "./AppLayout.module.css";

const AppLayout: React.FC = () => {
  const [active, setActive] = useState("vender");
  const [isModalOpen, setModalOpen] = useState(false);

  const handleNewItem = (data: any) => {
    console.log("Novo registro:", data);
    // Aqui você pode adicionar lógica para salvar os dados em um estado ou API
  };

  return (
    <div className={styles.layout}>
      <Sidebar active={active} onSelect={setActive} />
      <main style={{ flex: 1 }}>
        {active === "vender" && <SalesTable />}
        {active === "compras" && <Purchases />}
        {active === "ideias" && <Ideas />}
      </main>

      <FloatingButton onClick={() => setModalOpen(true)} />

      {isModalOpen && (
        <ModalForm
          type={
            active === "vender"
              ? "venda"
              : active === "compras"
              ? "compra"
              : "ideia"
          }
          onClose={() => setModalOpen(false)}
          onSubmit={handleNewItem}
        />
      )}
    </div>
  );
};

export default AppLayout;
