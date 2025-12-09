import  { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import SalesTable from "./SalesTable";
import Purchases from "./Purchases";
import Ideas from "./Ideas";

import styles from "./AppLayout.module.css";
import Dashboard from "./Dashboard";
import HistoricList from "./Historic";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

export default function AppLayout() {
  const [active, setActive] = useState("ideias");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ✅ VERIFICA LOGIN AO ABRIR O SISTEMA
  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (!data) return;

    const auth = JSON.parse(data);
    const agora = Date.now();
    const diferencaHoras = (agora - auth.loginTime) / (1000 * 60 * 60);

    if (diferencaHoras < 10) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("auth");
    }
  }, []);

  // ✅ LOGOUT (SE QUISER USAR DEPOIS)
  // function handleLogout() {
  //   localStorage.removeItem("auth");
  //   setIsAuthenticated(false);
  // }

  // ✅ SE NÃO ESTIVER LOGADO → MOSTRA LOGIN OU CADASTRO
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterPage
          onSelect={() => {
            setShowRegister(false);
          }}
        />
      );
    }

    return (
      <LoginPage
        onSelect={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // ✅ SE ESTIVER LOGADO → MOSTRA O SISTEMA
  return (
    <div className={styles.layout}>
      <Sidebar active={active} onSelect={setActive} />

      <main style={{ flex: 1 }}>
        {active === "vender" && <SalesTable />}
        {active === "compras" && <Purchases />}
        {active === "ideias" && <Ideas />}
        {active === "dashboard" && <Dashboard />}
        {active === "historico" && <HistoricList />}
      </main>
    </div>
  );
}
