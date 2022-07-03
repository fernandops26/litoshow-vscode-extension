export default function StopItem({ name, position, current }: { name: string, position: number, current: bool }) {
    return <div
        className={
            'p-1 px-2 hover:bg-gray-800 rounded ' + (current ? 'font-bold': '')
        }
    >
        {name}
    </div>
}