import { useEffect, useState } from "react";
import { sendLogin } from "../services/userService";
import styles from "./Login.module.css";

interface SidebarProps {
  onSelect: (key: string) => void;
}

export const LoginPage:React.FC<SidebarProps> = ({ onSelect }) =>{

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (!data) return;

    const auth = JSON.parse(data);
    const agora = Date.now();
    const diferencaHoras = (agora - auth.loginTime) / (1000 * 60 * 60);

    if (diferencaHoras < 10) {
     //   alert("Estou logado")
        onSelect("ideias")
    } else {
      localStorage.removeItem("auth");
    }
  }, []);


    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
        // ✅ 1. Verifica user e senha no banco
        const user = await sendLogin(email, password);

        const agora = Date.now();

        // ✅ 4. Salva no localStorage as infos + permissões
        localStorage.setItem(
            "auth",
            JSON.stringify({
            userId: user.docId,
            userName: user.userName,
            permissions: user.permition, // se existir no seu model
            loginTime: agora,
            })
        );

        // ✅ 5. Redireciona após login
            onSelect("ideias")
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }


  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.card}>
        <h2 className={styles.title}>Acesso ao Sistema</h2>

        <input
          type="text"
          placeholder="Usuário"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />

        <button className={styles.button} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>

  );
    }
