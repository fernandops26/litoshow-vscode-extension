import { render } from 'react-dom';
import Button from '@components/Button';
import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { PlayIcon, RefreshIcon, PauseIcon } from '@heroicons/react/outline';

interface StatusUpdate {
  status: string;
  total: number;
  current: number;
  percent: number;
}

export default function MacroView() {
  const [status, setStatus] = useState<StatusUpdate>({
    total: 100,
    current: 0,
    status: 'paused',
    percent: 0,
  });

  useEffect(() => {
    window.addEventListener('message', onMessage);
  }, []);

  const onMessage = ({ data }: MessageEvent) => {
    if (data.type == 'update-status') {
      onStatusChange(data.value);
    }
  };

  const onStatusChange = (status: any) => {
    setStatus({
      ...status,
      percent: Math.round((status.current / status.total) * 100),
    });
  };

  const onChange = (number: number | number[]) => {
    const current = Array.isArray(number) ? number[0] : number;
    setStatus({
      ...status,
      current,
    });

    tsvscode.postMessage({
      type: 'move-position',
      value: current,
    });
  };

  const onClickRestart = () => {
    tsvscode.postMessage({
      type: 'restart',
      value: null,
    });
  };

  const onClickPause = () => {
    tsvscode.postMessage({
      type: 'pause',
      value: null,
    });
  };

  const onClickPlay = () => {
    tsvscode.postMessage({
      type: 'play',
      value: null,
    });
  };

  const renderMainButton = () => {
    let button = <></>;
    if (status.status == 'playing') {
      button = (
        <div className='play text-center'>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPause}
          >
            <PauseIcon className='w-6 h-6' />
          </div>
        </div>
      );
    }

    if (status.status == 'paused') {
      button = (
        <div className='play text-center'>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPlay}
          >
            <PlayIcon className='w-6 h-6' />
          </div>
        </div>
      );
    }

    if (status.status == 'stopped') {
      button = (
        <div className='play text-center'>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickRestart}
          >
            <RefreshIcon className='w-6 h-6' />
          </div>
        </div>
      );
    }

    return button;
  };

  return (
    <div className='p-4'>
      <div className='bg-white rounded shadow text-gray-700'>
        <div className='flex items-center p-2'>
          {renderMainButton()}
          <div className='px-4 w-full'>
            <Slider
              min={0}
              max={status.total}
              value={status.current}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

render(<MacroView />, document.body);
