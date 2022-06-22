import { render } from 'react-dom';
import Button from '@components/Button';
import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  RefreshIcon,
  PauseIcon,
} from '@heroicons/react/outline';

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
    const percent = Array.isArray(number) ? number[0] : number;
    setStatus({
      ...status,
      percent,
    });

    const positionToMove = Math.round((percent * status.total) / 100);

    tsvscode.postMessage({
      type: 'move-position',
      value: positionToMove > 0 ? positionToMove - 1 : positionToMove,
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

  //const percent = Math.round((status.current / status.total) * 100);

  const isLast = status.current === status.total;

  const renderMainButton = () => {
    let button = <></>;
    if (status.status == 'playing') {
      button = (
        <div className='play m-3 text-center'>
          <div
            className='p-2 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPause}
          >
            <PauseIcon className='w-10 h-10' />
          </div>
          <span>Pause</span>
        </div>
      );
    }

    if (status.status == 'paused') {
      button = (
        <div className='play m-3 text-center'>
          <div
            className='p-2 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPlay}
          >
            <PlayIcon className='w-10 h-10' />
          </div>
          <span>Play</span>
        </div>
      );
    }

    if (status.status == 'stopped') {
      button = (
        <div className='play m-3 text-center'>
          <div
            className='p-2 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickRestart}
          >
            <RefreshIcon className='w-10 h-10' />
          </div>
          <span>Restart</span>
        </div>
      );
    }

    return button;
  };

  return (
    <div>
      <div className='flex justify-center flex-wrap'>
        <h1 className='text-white text-xl'>Macro Player</h1>
      </div>
      <div className='p-4 bg-white rounded shadow m-5 text-gray-700'>
        <div className='controls flex justify-center items-center'>
          <div className='fordward m-3 text-center'>
            <div className='p-2 shadow rounded-full m-auto cursor-pointer'>
              <ChevronLeftIcon className='h-8 w-8' />
            </div>
            <span>Back</span>
          </div>
          {renderMainButton()}
          <div className='backward m-3 text-center'>
            <div className='p-2 shadow rounded-full m-auto cursor-pointer'>
              <ChevronRightIcon className='h-8 w-8' />
            </div>
            <span>Skip</span>
          </div>
        </div>
        <Slider min={0} max={100} value={status.percent} onChange={onChange} />
        {status.status}
      </div>
    </div>
  );
}

render(<MacroView />, document.body);
