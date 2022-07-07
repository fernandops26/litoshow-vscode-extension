import MacroList from '../MacroList';
import Config from '../Config';

import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from '@vscode/webview-ui-toolkit/react'

export default function MyTabs() {
  return <>
    <VSCodePanels aria-label="Default">
      <VSCodePanelTab id='1'>List</VSCodePanelTab>
      <VSCodePanelTab id='2'>Settings</VSCodePanelTab>
      <VSCodePanelView id='1' className='w-full'>
        <MacroList/>
      </VSCodePanelView>
      <VSCodePanelView id='2' className='w-full'>
        <Config/>
      </VSCodePanelView>
    </VSCodePanels>
  </>
}
