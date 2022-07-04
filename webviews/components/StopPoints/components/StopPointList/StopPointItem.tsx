export default function MacroItem({ item, isActive }) {
  return (
    <div className='p-1 px-4 hover:bg-vscode-background flex items-center group'>
      <span className='cursor-pointer'>
        {item.name}
      </span>
    </div>
  );
}
