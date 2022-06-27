import { DotsHorizontalIcon } from '@heroicons/react/outline';
import MacroItemMenu from './MacroItemMenu';

export default function MacroItem({ item }) {
  const onSelect = () => {
    tsvscode.postMessage({
      type: 'selectMacro',
      data: {
        macroId: item.id || item.name,
      },
    });
  };

  return (
    <div className='p-1 px-4 hover:bg-vscode-background flex items-center group'>
      <span className='cursor-pointer' onClick={onSelect}>
        {item.name}
      </span>

      <MacroItemMenu id={item.id || item.name} />
      {/*<DotsHorizontalIcon className='ml-auto w-4 h-4 invisible group-hover:visible cursor-pointer' />*/}
    </div>
  );
}
