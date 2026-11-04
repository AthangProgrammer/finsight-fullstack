export default function Heading({ title, subtitle, action }) {
  return (
    <div className="heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
