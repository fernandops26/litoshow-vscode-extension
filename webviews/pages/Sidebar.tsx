import { render } from 'react-dom';
import Tabs from '@components/Sidebar/components/Tabs';

export default function Sidebar() {
  const onClick = () => {
    tsvscode.postMessage({
      type: 'onInfo',
      value: '',
    });
  };

  return (
    <>
      <Tabs />
    </>
  );
}

render(<Sidebar />, document.body);
