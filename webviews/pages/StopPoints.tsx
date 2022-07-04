import { render } from 'react-dom';
import StopPointList from '@components/StopPoints/components/StopPointList';

export default function StopPoints() {
  return (
    <>
      <StopPointList />
    </>
  );
}

render(<StopPoints />, document.body);
