import { Link } from 'react-router-dom';
import Error404 from '../../assets/404.svg'

const Error404Page = () => {
  return (
    <div className='flex justify-center items-center flex-col h-screen w-full'>
      <div className="mb-10">
        <img
          src={Error404}
          className="dark:hidden max-h-[160px]"
          alt="image"
        />
      </div>

      <span className="badge badge-primary badge-outline mb-3">404 Error</span>

      <h3 className="text-3xl font-semibold mb-2">
        We have lost this page
      </h3>

      <div className="text-md text-default-800 mb-10">
        The requested page is missing. Check the URL or&nbsp;
        <Link to="/" className="text-primary font-medium hover:text-primary-active">
          Return Home
        </Link>
        .
      </div>
    </div>
  );
};

export default Error404Page;
