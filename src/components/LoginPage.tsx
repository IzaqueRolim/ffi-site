import { useEffect, useState } from "react";
import { sendLogin } from "../services/userService";

export function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ VERIFICA SESSÃO AO ABRIR A TELA
  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (!data) return;

    const auth = JSON.parse(data);
    const agora = Date.now();
    const diferencaHoras = (agora - auth.loginTime) / (1000 * 60 * 60);

    // ✅ Se sessão ainda estiver válida (menos de 10h)
    if (diferencaHoras < 10) {
    } else {
      // ❌ Sessão expirada
      localStorage.removeItem("auth");
    }
  }, []);

  // ✅ FUNÇÃO DE LOGIN
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

   sendLogin(email,password)
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="User"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input type="submit" value={loading ? "Entrando..." : "Entrar"} />
      </form>
    </div>
  );
}
