import { render } from 'react-dom';
import Button from '@components/Button';
import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Test from './../components/Test';

interface StatusUpdate {
  status: string;
  total: number;
  current: number;
}

export default function MacroView() {
  const [status, setStatus] = useState<StatusUpdate>({
    total: 100,
    current: 0,
    status: 'stopped',
  });

  useEffect(() => {
    window.addEventListener('message', onMessage);
  }, []);

  const onMessage = ({ data }: MessageEvent) => {
    console.log('data: ', data);
    if (data.type == 'update-status') {
      onStatusChange(data.value);
    }
  };

  const onStatusChange = (status: any) => {
    setStatus(status);
  };

  const onChange = (number: number | number[]) => {
    console.log(number);
  };

  const onClick = () => {
    tsvscode.postMessage({
      type: 'onInfo',
      value: 'Info message',
    });
  };

  console.log('--->', Slider);

  const percent = Math.round((status.current / status.total) * 100);

  return (
    <div>
      <div className='flex justify-center flex-wrap'>
        <h1 className='text-white text-xl'>Macro Player Viever</h1>
      </div>
      <div className='p-8 bg-white rounded shadow m-5'>
        <Slider min={0} max={100} value={percent} onChange={onChange} />
      </div>
    </div>
  );
}

render(<MacroView />, document.body);
