import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ justifyContent: "center" }}>
        <div className={styles.intro} style={{ width: "100%" }}>
          <h1 style={{
            margin: "0 auto",
          }}>TheNCTimes</h1>
        </div>
      </main>
    </div>
  );
}
