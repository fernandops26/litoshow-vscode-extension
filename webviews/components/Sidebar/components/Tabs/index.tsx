import MacroList from '../MacroList';

import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from '@vscode/webview-ui-toolkit/react'

export default function MyTabs() {
  return <>
    <VSCodePanels aria-label="Default">
      <VSCodePanelTab id='1'>Macros</VSCodePanelTab>
      <VSCodePanelView id='1' className='w-full px-0 py-2'>
        <MacroList/>
      </VSCodePanelView>
    </VSCodePanels>
  </>
}
