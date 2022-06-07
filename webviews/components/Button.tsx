export default function Button({ onClick = () => {} }) {
  return (
    <>
      <button onClick={onClick}>Click me!!</button>
    </>
  );
}
