// 遊戲入口：之後在這裡依網址切換 home / scene 兩個 view（M3）。

const root = document.getElementById("app");

function renderPlaceholder() {
  const title = document.createElement("h1");
  title.textContent = "Name It";

  const note = document.createElement("p");
  note.textContent = "Scenes are on the way.";

  root.replaceChildren(title, note);
}

renderPlaceholder();
