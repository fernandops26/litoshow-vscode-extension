import { render } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { PlayIcon, RefreshIcon, PauseIcon } from '@heroicons/react/outline';

interface StatusUpdate {
  status: string;
  total: number;
  current: number;
}

export default function MacroView() {
  const [status, setStatus] = useState<StatusUpdate>({
    total: 100,
    current: 0,
    status: 'no-initiated',
  });

  const [stopPoints, setStopPoints] = useState<{name: string, position:  number}[]>([]);

  useEffect(() => {
    window.addEventListener('message', onMessage);
  }, []);

  const onMessage = ({ data }: MessageEvent) => {
    if (data.type == 'update-status') {
      onStatusChange(data.value);
    }

    if (data.type == 'macro-player-context') {
      onInitialContext(data.value);
    }
  };

  const onInitialContext = ({total, current, status, stops}: { total:number, current: number, status: string, stops: Array<{name: string, position: number}>} ) => {
    setStatus({
      current,
      total,
      status
    });
    setStopPoints(stops);
  }

  const onStatusChange = (status: any) => {
    setStatus({
      ...status,
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

  const onClickResume = () => {
    tsvscode.postMessage({
      type: 'resume',
      value: null,
    });
  };

  const renderMainButton = () => {
    let button = <></>;
    if (status.status == 'no-initiated') {
      button = (
        <div className='play text-center '>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPlay}
          >
            <PlayIcon className='w-6 h-6 vscode-icon-foreground' />
          </div>
        </div>
      );
    }

    if (status.status == 'playing') {
      button = (
        <div className='play text-center '>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPause}
          >
            <PauseIcon className='w-6 h-6 vscode-icon-foreground' />
          </div>
        </div>
      );
    }

    if (status.status == 'paused') {
      button = (
        <div className='play text-center '>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickResume}
          >
            <PlayIcon className='w-6 h-6 vscode-icon-foreground' />
          </div>
        </div>
      );
    }

    if (status.status == 'stopped') {
      button = (
        <div className='play text-center '>
          <div
            className='p-1 shadow rounded-full m-auto cursor-pointer'
            onClick={onClickPlay}
          >
            <RefreshIcon className='w-6 h-6 vscode-icon-foreground' />
          </div>
        </div>
      );
    }

    return button;
  };

  useEffect(() => {
    tsvscode.postMessage({
      type: 'getInitialInfo',
      value: null,
    });
  }, [])

  const marks = useMemo(() => {
    return stopPoints.reduce((acc, curr) => {
      const defaultMark = {
        [curr.position]: <></>,
      }

      return {
        ...acc,
        ...defaultMark
      };
    }, {});
  }, [stopPoints]);

  return (
    <div className='p-4'>
      <div className='vscode-badge-background rounded shadow text-gray-700'>
        <div className='flex items-center p-2'>
          {renderMainButton()}
          <div className=' px-4 w-full'>
            <Slider
              min={0}
              max={status.total}
              value={status.current}
              onChange={onChange}
              marks={marks}
              disabled={status.status == 'no-initiated'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

render(<MacroView />, document.body);
