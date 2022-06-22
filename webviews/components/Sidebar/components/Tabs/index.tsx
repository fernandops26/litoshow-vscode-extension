import { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import MacroList from '../MacroList';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MyTabs() {
  return (
    <Tab.Group>
      <div className='border-b border-gray-200 px-4'>
        <Tab.List className='-mb-px flex space-x-8'>
          <Tab as={Fragment}>
            {({ selected }) => (
              <div
                className={classNames(
                  selected
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm cursor-pointer'
                )}
              >
                Macro
              </div>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <div
                className={classNames(
                  selected
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm cursor-pointer'
                )}
              >
                Setting
              </div>
            )}
          </Tab>
        </Tab.List>
      </div>
      <Tab.Panels className=''>
        <Tab.Panel>
          <MacroList />
        </Tab.Panel>
        <Tab.Panel>Coming</Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
