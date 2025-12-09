import { useState } from "react";
import { registerUser } from "../services/userService";
import styles from "./Register.module.css";

interface SidebarProps {
  onSelect: (key: string) => void;
}

export const RegisterPage:React.FC<SidebarProps> = () =>{

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        permissions: ["user"],
      });

      alert("Usuário cadastrado com sucesso!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
     <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.card}>
        <h2 className={styles.title}>Criar Conta</h2>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={styles.input}
        />

        <button className={styles.button} disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
