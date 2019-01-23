import lorem from "./lorem";

export function randomText() {
  const len = 100 + Math.floor(Math.random() * 120);
  const start = Math.floor(Math.random() * (lorem.length - len));
  return lorem.slice(start, start + len);
}

export function generateLogItem(id, _type) {
  const type = _type ? _type : Math.random() > 0.5 ? "text" : "image";

  if (type === "text") {
    return {
      ts: id,
      type,
      text: `${id} . ${randomText()}`
    };
  }
  return {
    ts: id,
    type,
    src: `/${100 + Math.floor(Math.random() * 200)}x${100 +
      Math.floor(Math.random() * 200)}/${500 +
      Math.floor(Math.random()) * 1000}`,
    text: `${id}. ${randomText()}`
  };
}
