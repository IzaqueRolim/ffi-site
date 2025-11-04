import React from "react";
import styles from "./FloatingButton.module.css";

interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      +
    </button>
  );
};

export default FloatingButton;
