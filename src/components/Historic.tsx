import { useEffect, useState } from "react";
import styles from "./Historic.module.css";
import { getHistoric } from "../services/historicoService";
import type { Historic } from "../types/Historico";
import { getFormattedDate } from "../utils/dateFormated";



export default function HistoricList() {
  const [historic, setHistoric] = useState<Historic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHistoric();
        setHistoric(data);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Carregando histórico...</p>;
  }

  if (historic.length === 0) {
    return <p className={styles.empty}>Nenhum histórico encontrado.</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Histórico de Ações</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ação</th>
            <th>Usuário</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {historic.map((item) => (
            <tr key={item.docId}>
              <td>{item.action}</td>
              <td>{item.user}</td>
              <td>{getFormattedDate(item.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
