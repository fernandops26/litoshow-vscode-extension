import { useEffect, useState } from 'react';
import StopPointItem from './StopPointItem';

export default function MacroList() {
  const [list, setList] = useState<{name: string, position:  number}[]>([]);

  useEffect(() => {
    window.addEventListener('message', onMessage);
  }, []);

  const onMessage = ({ data }: MessageEvent) => {
    if (data.type == 'updateStopPointList') {
      setList(data.value);
    }
  };

  return (
    <div>
      {list.map((item, index) => (
        <StopPointItem key={index} item={item} isActive={false} />
      ))}
    </div>
  );
}
