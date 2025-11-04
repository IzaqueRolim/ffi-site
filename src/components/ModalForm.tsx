import React, { useState } from "react";
import styles from "./ModalForm.module.css";
import { addPurchase } from "../services/purchaseService";

interface ModalFormProps {
  type: "venda" | "compra" | "ideia";
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ModalForm: React.FC<ModalFormProps> = ({ type, onClose, onSubmit }) => {
  const [form, setForm] = useState<any>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if(type === "venda"){
      
    }
    else if(type === "compra"){
      await addPurchase(form);
    }

    else if(type === "ideia"){

    }

    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>
          Cadastrar{" "}
          {type === "venda" ? "Venda" : type === "compra" ? "Compra" : "Ideia"}
        </h2>

        <form onSubmit={handleSubmit}>
          {type === "venda" && (
            <>
              <input
                name="produto"
                placeholder="Produto"
                onChange={handleChange}
                required
              />
              <input
                name="preco"
                type="number"
                step="0.01"
                placeholder="Preço"
                onChange={handleChange}
                required
              />
              <input
                name="cliente"
                placeholder="Cliente"
                onChange={handleChange}
                required
              />
              <input
                name="categoria"
                placeholder="Categoria"
                onChange={handleChange}
                required
              />
              <input
                name="origem"
                placeholder="Origem"
                onChange={handleChange}
                required
              />
            </>
          )}

          {type === "compra" && (
            <>
              <input
                name="item"
                placeholder="Item"
                onChange={handleChange}
                required
              />
              <input
                name="preco"
                type="number"
                step="0.01"
                placeholder="Preço"
                onChange={handleChange}
                required
              />
              <input
                name="quantidade"
                type="number"
                placeholder="Quantidade"
                onChange={handleChange}
                required
              />
              <input
                name="loja"
                placeholder="Loja"
                onChange={handleChange}
                required
              />
              <input
                name="pagamento"
                placeholder="Forma de pagamento"
                onChange={handleChange}
                required
              />
            </>
          )}

          {type === "ideia" && (
            <>
              <input
                name="titulo"
                placeholder="Título"
                onChange={handleChange}
                required
              />
              <textarea
                name="descricao"
                placeholder="Descrição"
                onChange={handleChange}
                required
              />
              <input
                name="imagem"
                type="url"
                placeholder="URL da imagem"
                onChange={handleChange}
              />
            </>
          )}

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Cancelar
            </button>
            <button type="submit" className={styles.submit}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
