import { VSCodeTextField, VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { useEffect, useState } from 'react'

interface Config {
    actionsPerSecond: number;
}

export default function Config() {
    const [config, setConfig] = useState<Config>({
        actionsPerSecond: 50
    })

    useEffect(() => {
        window.addEventListener('message', onMessage);
        tsvscode.postMessage({
            type: 'getConfiguration',
            value: null
          });
    }, [])


  const onMessage = ({ data }: MessageEvent) => {
    if (data.type == 'config') {
        setConfig(data.value);
    }
  };

  const onSave = () => {
    tsvscode.postMessage({
        type: 'setConfiguration',
        value: config.actionsPerSecond
      });
  }

  const onUpdate = (e: InputEvent) => {
    setConfig({
        ...config,
        actionsPerSecond: +e.target?.value
    })
  }

    return <div>
        <VSCodeTextField
            onInput={onUpdate}
            value={config.actionsPerSecond}
            type='text'
            placeholder='E.g: 50'
            className='w-full'
        >
            Actions per second
        </VSCodeTextField>
        <VSCodeButton onClick={onSave} className='w-full'>
            Save
        </VSCodeButton>
    </div>
}