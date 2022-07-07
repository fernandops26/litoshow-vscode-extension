import MacroItemMenu from './MacroItemMenu';

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
    <div className='py-1 px-2 hover:bg-vscode-background flex items-center group'>
      <span className='cursor-pointer' onClick={onSelect}>
        {item.name}
      </span>

      <MacroItemMenu id={item.id} />
      {/*<DotsHorizontalIcon className='ml-auto w-4 h-4 invisible group-hover:visible cursor-pointer' />*/}
    </div>
  );
}
