"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // useRouterでページ遷移
import styles from './CreateTopicPage.module.css';

const CreateTopicPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]); // 最初の選択肢2つ
  const [newOption, setNewOption] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) {
      alert("同じ名前の選択肢は追加できません");
      setNewOption("");
      return;
    }
    setOptions([...options, trimmed]);
    setNewOption(""); // 新しい選択肢入力をリセット
  };

  const handleSubmit = async () => {
    const newTheme = {
      title,
      options: options.map(opt => ({ label: opt, rating: 1500 })),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/themes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme),
      });
      if (res.ok) {
        router.push("/");  // 成功したらメインページに戻る
      } else {
        alert("Failed to submit theme");
      }
    } catch (error) {
      alert("Error submitting theme");
      console.error("Submit error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Topic</h1>

      <label className={styles.label}>Title</label>
      <input 
        className={styles.inputField}
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />

      <label className={styles.label}>Options</label>
      {options.map((option, index) => (
        <div key={index} className={styles.optionRow}>
          <input 
            className={styles.inputField}
            type="text" 
            placeholder="Option" 
            value={option} 
            onChange={(e) => handleOptionChange(index, e.target.value)} 
          />
        </div>
      ))}
      
      <div className={styles.addOption}>
        <input 
          className={styles.inputField}
          type="text" 
          placeholder="Add option" 
          value={newOption} 
          onChange={(e) => setNewOption(e.target.value)} 
        />
        <button onClick={handleAddOption}>Add option</button>
      </div>
      
      <button className={styles.submitButton} onClick={handleSubmit}>Create</button>

      <div className={styles.backButtonWrapper}>
        <button className={styles.backButton} onClick={() => router.push("/")}>戻る</button>
      </div>
    </div>
  );
};

export default CreateTopicPage;
