export default function MacroItem({ item, isActive }) {
  return (
    <div className='py-1 px-2 hover:bg-vscode-background flex items-center group'>
      <span className=''>
        {isActive && '👉 '}
        {item.name}
      </span>
    </div>
  );
}
