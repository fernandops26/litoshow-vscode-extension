import { Macro } from '../repositories/MacroRepository';

enum BufferTypes {
    Starting = 1,
    Change = 2,
    Stop = 3,
}

export function getStopList(macro: Macro | undefined): { name: string, position: number }[] {
    if (!macro) {
        return [];
    }

    const stopPoints = macro.buffers.filter(buffer => buffer.type === BufferTypes.Stop);

    return stopPoints.map(stopPoint => {
        return {
            name: stopPoint.stop.name,
            position: stopPoint.position,
        };
    });
}
