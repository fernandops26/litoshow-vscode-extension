import { render } from 'react-dom';
import Button from '@components/Button';

export default function HelloWorldView() {
  const onClick = () => {
    tsvscode.postMessage({
      type: 'onInfo',
      value: 'Info message',
    });
  };

  return (
    <>
      <h1>Hello from react!!!!!! :D :D</h1>
      <input type='text' />
      <Button onClick={onClick} />
    </>
  );
}

render(<HelloWorldView />, document.body);
