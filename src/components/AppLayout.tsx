import React, { useState } from "react";
import Sidebar from "./Sidebar";
import SalesTable from "./SalesTable";
import Purchases from "./Purchases";
import Ideas from "./Ideas";

import styles from "./AppLayout.module.css";
import Dashboard from "./Dashboard";
import HistoricList from "./Historic";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

const AppLayout: React.FC = () => {
  const [active, setActive] = useState("vender");

  return (
    <div className={styles.layout}>
      <Sidebar active={active} onSelect={setActive} />
      {/* <main style={{ flex: 1 }}>
        {active === "vender" &&   <SalesTable />}
        {active === "compras" &&  <Purchases />}
        {active === "ideias" &&   <Ideas />}
        {active === "dashboard"&& <Dashboard/>}
        {active === "historico" && <HistoricList/>}
      </main> */}

     <LoginPage/>
     <RegisterPage/>
    </div>
  );
};

export default AppLayout;
