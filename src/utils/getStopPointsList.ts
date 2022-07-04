import { Macro } from '../repositories/MacroRepository';
import { isStopPoint, StopPoint } from '../services/BufferManager';

enum BufferTypes {
    Starting = 1,
    Change = 2,
    Stop = 3,
}

export function formatStopPointList(stopPoints: StopPoint[]) {
    return stopPoints.map(stopPoint => {
        return {
            name: stopPoint.stop.name,
            position: stopPoint.position,
        };
    });
}

export function getStopList(macro: Macro | undefined): Array<{name: string, position: number}> {
    if (!macro) {
        return [];
    }

    const stopPoints = macro.buffers.filter(buffer => isStopPoint(buffer));

    return stopPoints.map((stopPoint) => {
        return {
            name: (<StopPoint>stopPoint).stop.name,
            position: (<StopPoint>stopPoint).position,
        };
    });
}
