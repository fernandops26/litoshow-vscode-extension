import { useEffect, useState } from 'react';
import StopPointItem from './StopPointItem';

export default function StopPointList() {
  const [list, setList] = useState<{name: string, position:  number}[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number>(-1);
  const [activeStopPoint, setActiveStopPoint] = useState<number>(-1);

  useEffect(() => {
    window.addEventListener('message', onMessage);
  }, []);

  const onMessage = ({ data }: MessageEvent) => {
    if (data.type == 'updateStopPointList') {
      setList(data.value);
    }
    if (data.type == 'update-status') {
      onStatusChange(data.value);
    }
  };

  const onStatusChange = (status: any) => {
    setCurrentPosition(status.current);
  }

  useEffect(() => {
    const stopPosition = findStopPointPositionFromCurrentPosition(currentPosition)
    if (activeStopPoint !== stopPosition) {
      setActiveStopPoint(stopPosition);
    }
  }, [currentPosition])

  const findStopPointPositionFromCurrentPosition = (currentPosition: number) => {
    const stopPoint = list.find((item, index) => {
      if (index === list.length - 1 && item.position <= currentPosition) {
        return item.position;
      }

      return item.position <= currentPosition && list[index + 1].position > currentPosition
    });

    return stopPoint ? stopPoint.position : -1;
  }

  return (
    <div>
      {list.map((item, index) => (
        <StopPointItem key={index} item={item} isActive={item.position == activeStopPoint} />
      ))}
    </div>
  );
}
