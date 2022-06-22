import { DotsHorizontalIcon } from '@heroicons/react/outline';
import { Macro } from './../../../../../src/types';

export default function MacroItem({ item }) {
  const onSelect = () => {
    tsvscode.postMessage({
      type: 'selectMacro',
      data: {
        macroId: item.id,
      },
    });
  };

  return (
    <div className='p-1 px-4 hover:bg-vscode-background flex items-center group'>
      <span className='cursor-pointer' onClick={onSelect}>
        {item.name}
      </span>

      <DotsHorizontalIcon className='ml-auto w-4 h-4 invisible group-hover:visible cursor-pointer' />
    </div>
  );
}
