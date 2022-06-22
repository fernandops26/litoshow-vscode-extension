import { useEffect, useState } from 'react';
import MacroItem from './MacroItem';
import { Macro } from './../../../../../src/types';

export default function MacroList() {
  const [list, setList] = useState<Macro[]>([]);

  useEffect(() => {
    window.addEventListener('message', onMessage);
    tsvscode.postMessage({
      type: 'requestMacroList',
    });
  }, []);

  const onMessage = ({ data }: MessageEvent) => {
    console.log('message here', data);
    if (data.type == 'updateMacroList') {
      setList(data.value.macros);
    }
  };

  return (
    <div>
      {list.map((item) => (
        <MacroItem key={item.id} item={item} />
      ))}
    </div>
  );
}
