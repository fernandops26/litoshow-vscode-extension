import StopItem from './StopItem'

export default function StopList({ items, currentPoint }) {
    return <div>
        <h2 className='text-xl font-bold'>Stop Points</h2>
        <div className='mt-1'>
            {items.map((item: {position: number, name: string}) => <StopItem {...item} current={item.position === currentPoint} />)}
        </div>
    </div>
}