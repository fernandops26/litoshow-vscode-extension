import MacroList from '../MacroList';
import Config from '../Config';
import FeedbackAndHelper from '../FeedbackAndHelper';

import {
  VSCodePanels,
  VSCodePanelTab,
  VSCodePanelView,
} from '@vscode/webview-ui-toolkit/react';

export default function MyTabs() {
  return (
    <>
      <VSCodePanels aria-label='Default'>
        <VSCodePanelTab id='1'>List</VSCodePanelTab>
        <VSCodePanelTab id='2'>Settings</VSCodePanelTab>
        <VSCodePanelTab id='3'>Support {'&'} Help</VSCodePanelTab>
        <VSCodePanelView id='1' className='w-full'>
          <MacroList />
        </VSCodePanelView>
        <VSCodePanelView id='2' className='w-full'>
          <div className='flex flex-col'>
            <Config />
          </div>
        </VSCodePanelView>
        <VSCodePanelView id='3' className='w-full'>
          <FeedbackAndHelper />
        </VSCodePanelView>
      </VSCodePanels>
    </>
  );
}
