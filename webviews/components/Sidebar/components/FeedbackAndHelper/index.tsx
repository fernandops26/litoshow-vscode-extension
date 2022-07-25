import {
  ChatAltIcon,
  ExclamationCircleIcon,
  SupportIcon,
  MailIcon,
} from '@heroicons/react/outline';

export default function FeedbackAndHelper() {
  return (
    <div>
      {/* <h3 className='font-lg font-bold'>Help and feedback</h3> */}
      <ul className='pl-0 grid gap-y-2'>
        <li className=''>
          <ExclamationCircleIcon className='inline w-4 h-4' />{' '}
          <span>
            <a href='https://discord.gg/gcN4434Hn2'>Report Issues</a>
          </span>
        </li>
        <li>
          <ChatAltIcon className='inline w-4 h-4' />{' '}
          <span>
            <a href='https://discord.gg/Cg9yk2xqkn'>Feature Requests</a>
          </span>
        </li>
        <li>
          <SupportIcon className='inline w-4 h-4' />{' '}
          <span>
            <a href='https://discord.gg/f3FWAB5spU'>Discord</a>
          </span>
        </li>
        <li>
          <MailIcon className='inline w-4 h-4' />{' '}
          <span>
            <a href='mailto:name@email.com'>support@litoshow.app</a>
          </span>
        </li>
      </ul>
    </div>
  );
}
