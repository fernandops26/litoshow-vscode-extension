import { useEffect, useState } from 'react';

/*let steps: Array<{
  startLine: number;
  endLine: number;
  number: number;
  order: number;
}> = [];*/

type Step = {
  startLine: number;
  endLine: number;
  number: number;
  order: number;
};

export default function Steps() {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    window.addEventListener('message', ({ data }) => {
      switch (data.type) {
        case 'add-step':
          console.log(data.value);
          console.log(steps.length);
          setSteps((oldSteps) => [
            ...oldSteps,
            {
              startLine: data.value.startLine,
              endLine: data.value.endLine,
              number: oldSteps.length + 1,
              order: oldSteps.length + 1,
            },
          ]);
          break;
      }
    });
  }, []);

  return (
    <>
      <ul>
        {steps.map((step) => {
          return (
            <li>
              Step {step.number}:{' '}
              {`from line: ${step.startLine} to line: ${step.endLine}`}
            </li>
          );
        })}
      </ul>
    </>
  );
}
