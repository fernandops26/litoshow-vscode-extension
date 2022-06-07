import { render } from 'react-dom';
import Steps from '@components/Steps';

export default function Sidebar() {
  const onClick = () => {
    tsvscode.postMessage({
      type: 'onInfo',
      value: '',
    });
  };

  return (
    <>
      <h1>Steps</h1>
      <Steps />
    </>
  );
}

render(<Sidebar />, document.body);
