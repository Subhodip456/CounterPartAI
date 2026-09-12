export default function Footer({ text, copyright }) {
  return <footer className="cp-footer"><div className="cp-wrap cp-footer-inner"><div>{text}</div><div>{copyright}</div></div></footer>;
}
