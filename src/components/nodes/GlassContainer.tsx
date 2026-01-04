"use client";

import { ReactNode } from "react";
import styles from "./GlassContainer.module.css";

type Props = {
  children: ReactNode;
};

export default function GlassContainer({ children }: Props) {
  return (
    <div className={styles.glass}>
      {children}
    </div>
  );
}
