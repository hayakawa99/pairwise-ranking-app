// frontend/components/CreateThemeForm.tsx
import { useState } from "react";

type Props = {
  onSubmit: (title: string, optA: string, optB: string) => void;
};

const CreateThemeForm = ({ onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");

  const handleSubmit = () => {
    onSubmit(title, optA, optB);
  };

  return (
    <div>
      <input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="選択肢A"
        value={optA}
        onChange={(e) => setOptA(e.target.value)}
      />
      <input
        placeholder="選択肢B"
        value={optB}
        onChange={(e) => setOptB(e.target.value)}
      />
      <button onClick={handleSubmit}>送信</button>
    </div>
  );
};

export default CreateThemeForm;
