import {
  Menu as MenuInner,
  MenuItem as MenuItemInner,
  SubMenu as SubMenuInner,
  MenuButton,
  MenuDivider,
} from '@szhsin/react-menu';
import { DotsHorizontalIcon } from '@heroicons/react/outline';

const menuClassName = ({ state }) =>
  `box-border absolute z-50 text-sm bg-black p-1.5 border border-black rounded shadow-lg select-none focus:outline-none min-w-[9rem] ${
    state === 'closed' && 'hidden'
  } ${state === 'opening' && 'animate-fadeIn'} ${
    state === 'closing' && 'animate-fadeOut'
  }`;

const menuItemClassName = ({ hover, disabled, submenu }) =>
  `rounded px-3 py-1 focus:outline-none ${
    hover && 'text-white bg-blue-700 border-none outline-none'
  } ${disabled && 'text-gray-400'} ${
    submenu && "relative after:content-['❯'] after:absolute after:right-2.5"
  }`;

const Menu = (props) => (
  <MenuInner {...props} className='relative' menuClassName={menuClassName} />
);

const MenuItem = (props) => (
  <MenuItemInner {...props} className={menuItemClassName} />
);

const SubMenu = (props) => (
  <SubMenuInner
    {...props}
    offsetY={-7}
    className='relative'
    menuClassName={menuClassName}
    itemProps={{ className: menuItemClassName }}
  />
);

export default function MacroItemMenu({ id }) {
  const onClickRemove = () => {
    tsvscode.postMessage({
      type: 'removeMacro',
      data: {
        macroId: id,
      },
    });
  };

  return (
    <Menu
      transition={true}
      menuButton={
        <DotsHorizontalIcon className='ml-auto w-4 h-4 invisible group-hover:visible cursor-pointer' />
      }
    >
      <MenuItem>View</MenuItem>
      <MenuItem onClick={onClickRemove}>Remove</MenuItem>
    </Menu>
  );
}
